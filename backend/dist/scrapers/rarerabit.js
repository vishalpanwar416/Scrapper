export async function scrapeRareRabit(websiteId) {
    try {
        return { itemsScraped: 0, itemsUpdated: 0, status: 'success' };
    }
    catch (error) {
        return { itemsScraped: 0, itemsUpdated: 0, status: 'failed', error: error?.message || 'Unknown error' };
    }
}
