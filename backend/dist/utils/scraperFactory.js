import { scrapeSnitch } from '../scrapers/snitch.js';
import { scrapeRareRabit } from '../scrapers/rarerabit.js';
import { scrapeOffDuety } from '../scrapers/offduety.js';
import { scrapeZara } from '../scrapers/zara.js';
import { scrapeBeyoung } from '../scrapers/beyoung.js';
import { scrapeGeneric } from '../scrapers/generic.js';
/**
 * ScraperFactory manages dynamic scraper registration and selection
 * Supports both specific website scrapers and generic fallback
 */
class ScraperFactory {
    constructor() {
        this.scrapers = new Map();
        this.defaultScraper = scrapeGeneric;
        this.registerDefaultScrapers();
    }
    /**
     * Register the built-in scrapers for known websites
     */
    registerDefaultScrapers() {
        this.register('snitch', scrapeSnitch);
        this.register('rarerabbit', scrapeRareRabit);
        this.register('offduety', scrapeOffDuety);
        this.register('zara', scrapeZara);
        this.register('beyoung', scrapeBeyoung);
    }
    /**
     * Register a custom scraper for a website
     */
    register(websiteName, scraper) {
        const key = String(websiteName).toLowerCase().replace(/[^a-z0-9]/g, '');
        this.scrapers.set(key, scraper);
        console.log(`[ScraperFactory] Registered scraper for: ${key}`);
    }
    /**
     * Get scraper for a website - returns specific if available, else generic
     */
    getScraper(websiteName) {
        const key = String(websiteName).toLowerCase().replace(/[^a-z0-9]/g, '');
        const scraper = this.scrapers.get(key);
        if (scraper) {
            console.log(`[ScraperFactory] Using specific scraper for: ${key}`);
            return { type: 'specific', scraper };
        }
        console.log(`[ScraperFactory] No specific scraper for ${key}, using generic scraper`);
        return { type: 'generic', scraper: this.defaultScraper };
    }
    /**
     * Check if a specific scraper exists for a website
     */
    hasSpecificScraper(websiteName) {
        const key = String(websiteName).toLowerCase().replace(/[^a-z0-9]/g, '');
        return this.scrapers.has(key);
    }
    /**
     * Get list of all registered scrapers
     */
    listScrapers() {
        return Array.from(this.scrapers.keys());
    }
    /**
     * Get list of websites with specific scrapers
     */
    getRegisteredWebsites() {
        return this.listScrapers();
    }
}
// Export singleton instance
export const scraperFactory = new ScraperFactory();
