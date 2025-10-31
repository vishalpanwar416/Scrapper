import prisma from '../database/prisma';

export async function scrapeOffDuety(websiteId: string): Promise<{itemsScraped:number;itemsUpdated:number;status:string;error?:string}> {
  try {
    return { itemsScraped: 0, itemsUpdated: 0, status: 'success' };
  } catch (error: any) {
    return { itemsScraped: 0, itemsUpdated: 0, status: 'failed', error: error?.message || 'Unknown error' };
  }
}
