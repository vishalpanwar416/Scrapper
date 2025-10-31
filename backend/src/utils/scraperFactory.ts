import { scrapeSnitch } from '../scrapers/snitch.js';
import { scrapeRareRabit } from '../scrapers/rarerabit.js';
import { scrapeOffDuety } from '../scrapers/offduety.js';
import { scrapeZara } from '../scrapers/zara.js';
import { scrapeBeyoung } from '../scrapers/beyoung.js';
import { scrapeGeneric } from '../scrapers/generic.js';
import prisma from '../database/prisma.js';

export type SpecificScraperFunction = (websiteId: string) => Promise<{
  itemsScraped: number;
  itemsUpdated: number;
  status: string;
  error?: string;
}>;

export type GenericScraperFunction = (websiteId: string, websiteUrl: string) => Promise<{
  itemsScraped: number;
  itemsUpdated: number;
  status: string;
  error?: string;
}>;

export type ScraperFunction = SpecificScraperFunction | GenericScraperFunction;

/**
 * ScraperFactory manages dynamic scraper registration and selection
 * Supports both specific website scrapers and generic fallback
 */
class ScraperFactory {
  private scrapers: Map<string, SpecificScraperFunction> = new Map();
  private defaultScraper: GenericScraperFunction = scrapeGeneric;

  constructor() {
    this.registerDefaultScrapers();
  }

  /**
   * Register the built-in scrapers for known websites
   */
  private registerDefaultScrapers(): void {
    this.register('snitch', scrapeSnitch);
    this.register('rarerabbit', scrapeRareRabit);
    this.register('offduety', scrapeOffDuety);
    this.register('zara', scrapeZara);
    this.register('beyoung', scrapeBeyoung);
  }

  /**
   * Register a custom scraper for a website
   */
  register(websiteName: string, scraper: SpecificScraperFunction): void {
    const key = String(websiteName).toLowerCase().replace(/[^a-z0-9]/g, '');
    this.scrapers.set(key, scraper);
    console.log(`[ScraperFactory] Registered scraper for: ${key}`);
  }

  /**
   * Get scraper for a website - returns specific if available, else generic
   */
  getScraper(websiteName: string): { type: 'specific' | 'generic'; scraper: ScraperFunction } {
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
  hasSpecificScraper(websiteName: string): boolean {
    const key = String(websiteName).toLowerCase().replace(/[^a-z0-9]/g, '');
    return this.scrapers.has(key);
  }

  /**
   * Get list of all registered scrapers
   */
  listScrapers(): string[] {
    return Array.from(this.scrapers.keys());
  }

  /**
   * Get list of websites with specific scrapers
   */
  getRegisteredWebsites(): string[] {
    return this.listScrapers();
  }
}

// Export singleton instance
export const scraperFactory = new ScraperFactory();
