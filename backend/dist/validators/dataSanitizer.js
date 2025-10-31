/**
 * Data Sanitization Layer
 * Cleans and transforms raw scraped data
 */
/**
 * Sanitizes and transforms raw product data
 */
export class DataSanitizer {
    /**
     * Sanitize product title
     */
    static sanitizeTitle(title) {
        if (!title)
            return { clean: '', changed: true };
        let clean = String(title).trim();
        let changed = clean !== title;
        // Remove extra whitespace
        const normalized = clean.replace(/\s+/g, ' ');
        if (normalized !== clean) {
            changed = true;
            clean = normalized;
        }
        // Remove special HTML entities
        clean = this.decodeHtmlEntities(clean);
        // Remove leading/trailing special characters
        const trimmed = clean.replace(/^[\s\-_.]+|[\s\-_.]+$/g, '');
        if (trimmed !== clean) {
            changed = true;
            clean = trimmed;
        }
        // Capitalize first letter of each word
        const capitalized = clean
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        if (capitalized !== clean) {
            changed = true;
            clean = capitalized;
        }
        return { clean, changed };
    }
    /**
     * Sanitize product URL
     */
    static sanitizeUrl(url) {
        if (!url)
            return { clean: '', changed: true };
        let clean = String(url).trim();
        let changed = clean !== url;
        // Remove query parameters for tracking
        const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];
        const urlObj = this.parseUrl(clean);
        if (urlObj) {
            for (const param of trackingParams) {
                if (urlObj.searchParams.has(param)) {
                    urlObj.searchParams.delete(param);
                    changed = true;
                }
            }
            clean = urlObj.toString();
        }
        // Remove URL fragments
        const withoutFragment = clean.split('#')[0];
        if (withoutFragment !== clean) {
            changed = true;
            clean = withoutFragment;
        }
        return { clean, changed };
    }
    /**
     * Sanitize price
     */
    static sanitizePrice(price) {
        const original = price;
        let changed = false;
        // Parse if string
        let priceNum = typeof price === 'string' ? this.parsePrice(price) : Number(price);
        if (isNaN(priceNum)) {
            return { clean: 0, changed: true };
        }
        // Round to 2 decimal places
        const rounded = Math.round(priceNum * 100) / 100;
        if (rounded !== priceNum) {
            changed = true;
            priceNum = rounded;
        }
        if (original !== priceNum) {
            changed = true;
        }
        return { clean: priceNum, changed };
    }
    /**
     * Sanitize description
     */
    static sanitizeDescription(description) {
        if (!description)
            return { clean: '', changed: false };
        let clean = String(description).trim();
        let changed = clean !== description;
        // Decode HTML entities
        clean = this.decodeHtmlEntities(clean);
        // Remove extra whitespace
        const normalized = clean.replace(/\s+/g, ' ');
        if (normalized !== clean) {
            changed = true;
            clean = normalized;
        }
        // Remove control characters
        const filtered = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        if (filtered !== clean) {
            changed = true;
            clean = filtered;
        }
        // Remove script tags and dangerous content
        const safe = this.stripDangerousContent(clean);
        if (safe !== clean) {
            changed = true;
            clean = safe;
        }
        return { clean, changed };
    }
    /**
     * Sanitize image URL
     */
    static sanitizeImageUrl(url) {
        if (!url)
            return { clean: '', changed: false };
        const { clean, changed: urlChanged } = this.sanitizeUrl(url);
        let changed = urlChanged;
        // Validate image extension
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        const lowerUrl = clean.toLowerCase();
        let hasValidExtension = validExtensions.some(ext => lowerUrl.includes(ext));
        // If no valid extension, check if it might be an image anyway (some URLs don't have extensions)
        if (!hasValidExtension && lowerUrl.includes('image') || lowerUrl.includes('img') || lowerUrl.includes('photo')) {
            hasValidExtension = true;
        }
        return { clean: hasValidExtension ? clean : '', changed };
    }
    /**
     * Sanitize colors array
     */
    static sanitizeColors(colors) {
        if (!Array.isArray(colors))
            return { clean: [], changed: true };
        let changed = false;
        const clean = [];
        const seen = new Set();
        for (const color of colors) {
            if (!color) {
                changed = true;
                continue;
            }
            let colorStr = String(color).trim();
            // Decode HTML entities
            colorStr = this.decodeHtmlEntities(colorStr);
            // Remove special characters but keep common ones
            const normalized = colorStr.replace(/[^\w\s\-]/g, '').trim();
            if (normalized !== colorStr) {
                changed = true;
                colorStr = normalized;
            }
            // Remove duplicates
            const lower = colorStr.toLowerCase();
            if (!seen.has(lower) && colorStr.length > 0) {
                clean.push(colorStr);
                seen.add(lower);
            }
            else if (colorStr.length > 0) {
                changed = true;
            }
        }
        if (clean.length !== colors.length) {
            changed = true;
        }
        return { clean, changed };
    }
    /**
     * Sanitize sizes array
     */
    static sanitizeSizes(sizes) {
        if (!Array.isArray(sizes))
            return { clean: [], changed: true };
        let changed = false;
        const clean = [];
        const seen = new Set();
        for (const size of sizes) {
            if (!size) {
                changed = true;
                continue;
            }
            let sizeStr = String(size).trim().toUpperCase();
            // Standardize common size formats
            sizeStr = this.standardizeSizeFormat(sizeStr);
            // Remove duplicates
            if (!seen.has(sizeStr) && sizeStr.length > 0) {
                clean.push(sizeStr);
                seen.add(sizeStr);
            }
            else if (sizeStr.length > 0) {
                changed = true;
            }
        }
        if (clean.length !== sizes.length) {
            changed = true;
        }
        return { clean, changed };
    }
    /**
     * Parse price from string
     */
    static parsePrice(priceStr) {
        const match = String(priceStr).match(/[\d,]+\.?\d*/);
        if (match) {
            return parseFloat(match[0].replace(/,/g, ''));
        }
        return 0;
    }
    /**
     * Decode HTML entities
     */
    static decodeHtmlEntities(str) {
        const entities = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#39;': "'",
            '&nbsp;': ' ',
            '&copy;': '©',
            '&reg;': '®',
            '&deg;': '°',
        };
        let result = str;
        for (const [entity, char] of Object.entries(entities)) {
            result = result.replace(new RegExp(entity, 'g'), char);
        }
        return result;
    }
    /**
     * Strip dangerous content
     */
    static stripDangerousContent(str) {
        // Remove script tags
        let clean = str.replace(/<script[^>]*>.*?<\/script>/gi, '');
        // Remove iframe tags
        clean = clean.replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');
        // Remove event handlers
        clean = clean.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
        return clean;
    }
    /**
     * Parse URL safely
     */
    static parseUrl(urlStr) {
        try {
            return new URL(urlStr);
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Standardize size format
     */
    static standardizeSizeFormat(size) {
        // Common replacements
        const replacements = {
            'EXTRA SMALL': 'XS',
            'EXTRA LARGE': 'XL',
            'SMALL': 'S',
            'MEDIUM': 'M',
            'LARGE': 'L',
            'EXTRA EXTRA LARGE': 'XXL',
        };
        for (const [key, value] of Object.entries(replacements)) {
            if (size === key) {
                return value;
            }
        }
        // For numeric sizes, ensure proper format (e.g., 36.5 instead of 36,5)
        if (/^\d+[.,]\d+$/.test(size)) {
            return size.replace(',', '.');
        }
        return size;
    }
    /**
     * Sanitize complete product data
     */
    static sanitizeProduct(product) {
        const changes = [];
        let allValid = true;
        const { clean: title, changed: titleChanged } = this.sanitizeTitle(product.title);
        if (titleChanged)
            changes.push('title');
        if (!title)
            allValid = false;
        const { clean: url, changed: urlChanged } = this.sanitizeUrl(product.url);
        if (urlChanged)
            changes.push('url');
        if (!url)
            allValid = false;
        const { clean: price, changed: priceChanged } = this.sanitizePrice(product.price);
        if (priceChanged)
            changes.push('price');
        const { clean: originalPrice, changed: originalPriceChanged } = this.sanitizePrice(product.originalPrice);
        if (originalPriceChanged && product.originalPrice)
            changes.push('originalPrice');
        const { clean: description, changed: descChanged } = this.sanitizeDescription(product.description);
        if (descChanged)
            changes.push('description');
        const { clean: imageUrl, changed: imageChanged } = this.sanitizeImageUrl(product.imageUrl);
        if (imageChanged)
            changes.push('imageUrl');
        const { clean: colors, changed: colorsChanged } = this.sanitizeColors(product.colors);
        if (colorsChanged)
            changes.push('colors');
        const { clean: sizes, changed: sizesChanged } = this.sanitizeSizes(product.sizes);
        if (sizesChanged)
            changes.push('sizes');
        return {
            valid: allValid,
            title,
            url,
            price,
            originalPrice: originalPrice > 0 ? originalPrice : undefined,
            description: description || undefined,
            imageUrl: imageUrl || undefined,
            colors,
            sizes,
            metadata: {
                sanitized: changes.length > 0,
                changes,
            },
        };
    }
}
export default DataSanitizer;
