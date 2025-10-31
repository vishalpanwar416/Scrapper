/**
 * Product Validation Middleware
 * Validates scraped product data before storing in database
 */

export interface ValidationError {
  field: string;
  value: any;
  error: string | undefined;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  cleanedData?: CleanedProduct;
}

export interface RawProduct {
  title?: string;
  url?: string;
  price?: string | number;
  originalPrice?: string | number;
  description?: string;
  imageUrl?: string;
  colors?: string[];
  sizes?: { size: string; available: boolean; stock: number }[];
}

export interface CleanedProduct {
  title: string | undefined;
  url: string | undefined;
  price: number;
  originalPrice?: number;
  description?: string;
  imageUrl?: string;
  colors: { name: string; code?: string }[];
  sizes: { size: string; available: boolean; stock: number }[];
}

/**
 * Validate product data
 */
export class ProductValidator {
  private static readonly VALIDATION_RULES = {
    title: {
      minLength: 3,
      maxLength: 500,
      required: true,
      pattern: /^[a-zA-Z0-9\s\-,.&()\/\'"]+$/, // Alphanumeric + common chars
    },
    url: {
      required: true,
      pattern: /^https?:\/\/.+/, // Must be valid URL
    },
    price: {
      required: true,
      min: 0,
      max: 10000000, // Max price limit
    },
    originalPrice: {
      required: false,
      min: 0,
      max: 10000000,
    },
    description: {
      maxLength: 2000,
      required: false,
    },
    imageUrl: {
      pattern: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i,
      required: false,
    },
    colors: {
      maxItems: 50,
      nameMaxLength: 50,
    },
    sizes: {
      maxItems: 100,
      sizeMaxLength: 20,
    },
  };

  /**
   * Main validation method
   */
  static validate(product: RawProduct): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    let cleanedData: CleanedProduct | undefined;

    // Validate title
    const titleValidation = this.validateTitle(product.title);
    if (!titleValidation.valid) {
      errors.push({
        field: 'title',
        value: product.title,
        error: titleValidation.error,
        severity: 'error',
      });
    }

    // Validate URL
    const urlValidation = this.validateUrl(product.url);
    if (!urlValidation.valid) {
      errors.push({
        field: 'url',
        value: product.url,
        error: urlValidation.error,
        severity: 'error',
      });
    }

    // Validate price
    const priceValidation = this.validatePrice(product.price);
    if (!priceValidation.valid) {
      errors.push({
        field: 'price',
        value: product.price,
        error: priceValidation.error,
        severity: 'error',
      });
    }

    // Validate originalPrice
    if (product.originalPrice !== undefined) {
      const originalPriceValidation = this.validateOriginalPrice(product.originalPrice, product.price);
      if (!originalPriceValidation.valid) {
        if (originalPriceValidation.severity === 'error') {
          errors.push({
            field: 'originalPrice',
            value: product.originalPrice,
            error: originalPriceValidation.error,
            severity: 'error',
          });
        } else {
          warnings.push({
            field: 'originalPrice',
            value: product.originalPrice,
            error: originalPriceValidation.error,
            severity: 'warning',
          });
        }
      }
    }

    // Validate description
    if (product.description !== undefined) {
      const descriptionValidation = this.validateDescription(product.description);
      if (!descriptionValidation.valid) {
        warnings.push({
          field: 'description',
          value: product.description,
          error: descriptionValidation.error,
          severity: 'warning',
        });
      }
    }

    // Validate imageUrl
    if (product.imageUrl !== undefined) {
      const imageValidation = this.validateImageUrl(product.imageUrl);
      if (!imageValidation.valid) {
        warnings.push({
          field: 'imageUrl',
          value: product.imageUrl,
          error: imageValidation.error,
          severity: 'warning',
        });
      }
    }

    // Validate colors
    let cleanedColors: { name: string; code?: string }[] = [];
    if (product.colors) {
      const colorsValidation = this.validateColors(product.colors);
      cleanedColors = colorsValidation.cleaned;
      if (colorsValidation.warnings.length > 0) {
        warnings.push(...colorsValidation.warnings);
      }
    }

    // Validate sizes
    let cleanedSizes: { size: string; available: boolean; stock: number }[] = [];
    if (product.sizes) {
      const sizesValidation = this.validateSizes(product.sizes);
      cleanedSizes = sizesValidation.cleaned;
      if (sizesValidation.warnings.length > 0) {
        warnings.push(...sizesValidation.warnings);
      }
    }

    // If no critical errors, create cleaned data
    if (errors.length === 0) {
      cleanedData = {
        title: (product.title || '').trim() || undefined,
        url: (product.url || '').trim() || undefined,
        price: priceValidation.price!,
        originalPrice: priceValidation.originalPrice,
        description: product.description?.trim() || undefined,
        imageUrl: product.imageUrl?.trim() || undefined,
        colors: cleanedColors,
        sizes: cleanedSizes,
      };
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      cleanedData,
    };
  }

  /**
   * Validate product title
   */
  private static validateTitle(title: any): { valid: boolean; error?: string } {
    const rules = this.VALIDATION_RULES.title;

    if (!title) {
      return { valid: false, error: 'Title is required' };
    }

    const titleStr = String(title).trim();

    if (titleStr.length < rules.minLength) {
      return { valid: false, error: `Title must be at least ${rules.minLength} characters` };
    }

    if (titleStr.length > rules.maxLength) {
      return { valid: false, error: `Title must not exceed ${rules.maxLength} characters` };
    }

    if (!rules.pattern.test(titleStr)) {
      return { valid: false, error: 'Title contains invalid characters' };
    }

    return { valid: true };
  }

  /**
   * Validate product URL
   */
  private static validateUrl(url: any): { valid: boolean; error?: string } {
    const rules = this.VALIDATION_RULES.url;

    if (!url) {
      return { valid: false, error: 'URL is required' };
    }

    const urlStr = String(url).trim();

    if (!rules.pattern.test(urlStr)) {
      return { valid: false, error: 'URL must be a valid HTTP/HTTPS link' };
    }

    // Check URL length
    if (urlStr.length > 2048) {
      return { valid: false, error: 'URL is too long (max 2048 characters)' };
    }

    return { valid: true };
  }

  /**
   * Validate product price
   */
  private static validatePrice(price: any): {
    valid: boolean;
    error?: string;
    price?: number;
    originalPrice?: number;
  } {
    const rules = this.VALIDATION_RULES.price;

    if (price === undefined || price === null) {
      return { valid: false, error: 'Price is required' };
    }

    const priceNum = typeof price === 'string' ? this.parsePrice(price) : Number(price);

    if (isNaN(priceNum)) {
      return { valid: false, error: 'Price must be a valid number' };
    }

    if (priceNum < rules.min) {
      return { valid: false, error: `Price must be greater than or equal to ${rules.min}` };
    }

    if (priceNum > rules.max) {
      return { valid: false, error: `Price must not exceed ${rules.max}` };
    }

    return { valid: true, price: priceNum };
  }

  /**
   * Validate original price (should be >= current price)
   */
  private static validateOriginalPrice(originalPrice: any, price: any): {
    valid: boolean;
    error?: string;
    severity: 'error' | 'warning';
  } {
    const rules = this.VALIDATION_RULES.originalPrice;

    if (originalPrice === undefined || originalPrice === null) {
      return { valid: true, severity: 'warning', error: 'No original price provided' };
    }

    const originalPriceNum = typeof originalPrice === 'string'
      ? this.parsePrice(originalPrice)
      : Number(originalPrice);

    if (isNaN(originalPriceNum)) {
      return {
        valid: false,
        error: 'Original price must be a valid number',
        severity: 'warning'
      };
    }

    if (originalPriceNum < rules.min) {
      return {
        valid: false,
        error: `Original price must be >= ${rules.min}`,
        severity: 'warning'
      };
    }

    if (originalPriceNum > rules.max) {
      return {
        valid: false,
        error: `Original price must not exceed ${rules.max}`,
        severity: 'warning'
      };
    }

    // Check if original price is less than current price
    const currentPrice = typeof price === 'string' ? this.parsePrice(price) : Number(price);
    if (originalPriceNum < currentPrice) {
      return {
        valid: false,
        error: 'Original price must be greater than or equal to current price',
        severity: 'warning'
      };
    }

    return { valid: true, severity: 'warning' };
  }

  /**
   * Validate description
   */
  private static validateDescription(description: any): { valid: boolean; error?: string } {
    const rules = this.VALIDATION_RULES.description;

    if (!description) {
      return { valid: true };
    }

    const descStr = String(description).trim();

    if (descStr.length > rules.maxLength) {
      return { valid: false, error: `Description must not exceed ${rules.maxLength} characters` };
    }

    return { valid: true };
  }

  /**
   * Validate image URL
   */
  private static validateImageUrl(imageUrl: any): { valid: boolean; error?: string } {
    const rules = this.VALIDATION_RULES.imageUrl;

    if (!imageUrl) {
      return { valid: true };
    }

    const imageStr = String(imageUrl).trim();

    if (!rules.pattern.test(imageStr)) {
      return { valid: false, error: 'Image URL must be a valid HTTP/HTTPS link to an image file' };
    }

    return { valid: true };
  }

  /**
   * Validate colors
   */
  private static validateColors(colors: any): {
    cleaned: { name: string; code?: string }[];
    warnings: ValidationError[]
  } {
    const rules = this.VALIDATION_RULES.colors;
    const cleaned: { name: string; code?: string }[] = [];
    const warnings: ValidationError[] = [];

    if (!Array.isArray(colors)) {
      return { cleaned: [], warnings: [] };
    }

    if (colors.length > rules.maxItems) {
      warnings.push({
        field: 'colors',
        value: colors,
        error: `Too many colors (max ${rules.maxItems}). Only first ${rules.maxItems} will be stored.`,
        severity: 'warning',
      });
    }

    colors.slice(0, rules.maxItems).forEach((color: any, index: number) => {
      if (typeof color === 'string') {
        const colorName = color.trim();
        if (colorName.length > 0 && colorName.length <= rules.nameMaxLength) {
          cleaned.push({ name: colorName });
        } else if (colorName.length > rules.nameMaxLength) {
          warnings.push({
            field: `colors[${index}]`,
            value: color,
            error: `Color name too long (max ${rules.nameMaxLength} chars). Truncating.`,
            severity: 'warning',
          });
          cleaned.push({ name: colorName.substring(0, rules.nameMaxLength) });
        }
      } else if (typeof color === 'object' && color !== null) {
        const colorName = String(color.name || '').trim();
        if (colorName.length > 0 && colorName.length <= rules.nameMaxLength) {
          cleaned.push({
            name: colorName,
            code: color.code ? String(color.code).trim() : undefined,
          });
        }
      }
    });

    return { cleaned, warnings };
  }

  /**
   * Validate sizes
   */
  private static validateSizes(sizes: any): {
    cleaned: { size: string; available: boolean; stock: number }[];
    warnings: ValidationError[]
  } {
    const rules = this.VALIDATION_RULES.sizes;
    const cleaned: { size: string; available: boolean; stock: number }[] = [];
    const warnings: ValidationError[] = [];

    if (!Array.isArray(sizes)) {
      return { cleaned: [], warnings: [] };
    }

    if (sizes.length > rules.maxItems) {
      warnings.push({
        field: 'sizes',
        value: sizes,
        error: `Too many sizes (max ${rules.maxItems}). Only first ${rules.maxItems} will be stored.`,
        severity: 'warning',
      });
    }

    sizes.slice(0, rules.maxItems).forEach((size: any, index: number) => {
      if (typeof size === 'string') {
        const sizeStr = size.trim();
        if (sizeStr.length > 0 && sizeStr.length <= rules.sizeMaxLength) {
          cleaned.push({
            size: sizeStr,
            available: true,
            stock: 0,
          });
        } else if (sizeStr.length > rules.sizeMaxLength) {
          warnings.push({
            field: `sizes[${index}]`,
            value: size,
            error: `Size name too long (max ${rules.sizeMaxLength} chars). Truncating.`,
            severity: 'warning',
          });
          cleaned.push({
            size: sizeStr.substring(0, rules.sizeMaxLength),
            available: true,
            stock: 0,
          });
        }
      } else if (typeof size === 'object' && size !== null) {
        const sizeStr = String(size.size || '').trim();
        if (sizeStr.length > 0 && sizeStr.length <= rules.sizeMaxLength) {
          const stock = Number(size.stock) || 0;
          cleaned.push({
            size: sizeStr,
            available: size.available !== false,
            stock: Math.max(0, stock),
          });
        }
      }
    });

    return { cleaned, warnings };
  }

  /**
   * Convert size array format from string[] to object[]
   */
  static convertSizesFormat(sizes: string[]): { size: string; available: boolean; stock: number }[] {
    return sizes.map(size => ({
      size,
      available: true,
      stock: 0,
    }));
  }

  /**
   * Parse price from string
   */
  private static parsePrice(priceStr: string): number {
    const match = String(priceStr).match(/[\d,]+\.?\d*/);
    if (match) {
      return parseFloat(match[0].replace(/,/g, ''));
    }
    return 0;
  }

  /**
   * Validate multiple products in batch
   */
  static validateBatch(products: RawProduct[]): {
    valid: ValidationResult[];
    invalid: { product: RawProduct; result: ValidationResult }[];
    summary: {
      total: number;
      valid: number;
      invalid: number;
      errors: number;
      warnings: number;
    };
  } {
    const valid: ValidationResult[] = [];
    const invalid: { product: RawProduct; result: ValidationResult }[] = [];
    let totalErrors = 0;
    let totalWarnings = 0;

    for (const product of products) {
      const result = this.validate(product);
      if (result.isValid) {
        valid.push(result);
      } else {
        invalid.push({ product, result });
      }
      totalErrors += result.errors.length;
      totalWarnings += result.warnings.length;
    }

    return {
      valid,
      invalid,
      summary: {
        total: products.length,
        valid: valid.length,
        invalid: invalid.length,
        errors: totalErrors,
        warnings: totalWarnings,
      },
    };
  }
}

export default ProductValidator;
