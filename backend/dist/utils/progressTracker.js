const progressMap = new Map();
export function initializeProgress(websiteId) {
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
