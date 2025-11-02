const progressMap = new Map();
const PROGRESS_CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const PROGRESS_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes
// Initialize cleanup interval
let cleanupInterval = null;
function startCleanupInterval() {
    if (cleanupInterval)
        return;
    cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [websiteId, progress] of progressMap.entries()) {
            if (now - progress.timestamp > PROGRESS_EXPIRY_TIME) {
                progressMap.delete(websiteId);
            }
        }
    }, PROGRESS_CLEANUP_INTERVAL);
    // Prevent Node from keeping this interval alive
    cleanupInterval.unref?.();
}
export function initializeProgress(websiteId) {
    startCleanupInterval();
    progressMap.set(websiteId, {
        websiteId,
        stage: 'starting',
        message: 'Initializing scraper...',
        progress: 0,
        timestamp: Date.now(),
    });
}
export function updateProgress(websiteId, stage, message, progress, itemsProcessed, totalItems) {
    progressMap.set(websiteId, {
        websiteId,
        stage,
        message,
        progress,
        itemsProcessed,
        totalItems,
        timestamp: Date.now(),
    });
}
export function getProgress(websiteId) {
    const progress = progressMap.get(websiteId);
    // Clean up old progress (older than 5 minutes)
    if (progress && Date.now() - progress.timestamp > 5 * 60 * 1000) {
        progressMap.delete(websiteId);
        return undefined;
    }
    return progress;
}
export function clearProgress(websiteId) {
    progressMap.delete(websiteId);
}
export function getAllProgress() {
    const allProgress = [];
    progressMap.forEach((progress) => {
        // Skip old progress entries
        if (Date.now() - progress.timestamp <= 5 * 60 * 1000) {
            allProgress.push(progress);
        }
        else {
            progressMap.delete(progress.websiteId);
        }
    });
    return allProgress;
}
