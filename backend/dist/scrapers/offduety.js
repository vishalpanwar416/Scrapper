export async function scrapeOffDuety(websiteId) {
    try {
        return { itemsScraped: 0, itemsUpdated: 0, status: 'success' };
    }
    catch (error) {
        return { itemsScraped: 0, itemsUpdated: 0, status: 'failed', error: error?.message || 'Unknown error' };
    }
}
