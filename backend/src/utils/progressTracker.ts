// In-memory progress tracking for scraping operations
interface ProgressUpdate {
  websiteId: string;
  stage: 'starting' | 'navigating' | 'scraping' | 'saving' | 'completed';
  message: string;
  progress: number; // 0-100
  itemsProcessed?: number;
  totalItems?: number;
  timestamp: number;
}

const progressMap = new Map<string, ProgressUpdate>();
const PROGRESS_CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const PROGRESS_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

// Initialize cleanup interval
let cleanupInterval: NodeJS.Timer | null = null;

function startCleanupInterval(): void {
  if (cleanupInterval) return;

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

export function initializeProgress(websiteId: string): void {
  startCleanupInterval();
  progressMap.set(websiteId, {
    websiteId,
    stage: 'starting',
    message: 'Initializing scraper...',
    progress: 0,
    timestamp: Date.now(),
  });
}

export function updateProgress(
  websiteId: string,
  stage: ProgressUpdate['stage'],
  message: string,
  progress: number,
  itemsProcessed?: number,
  totalItems?: number
): void {
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

export function getProgress(websiteId: string): ProgressUpdate | undefined {
  const progress = progressMap.get(websiteId);
  // Clean up old progress (older than 5 minutes)
  if (progress && Date.now() - progress.timestamp > 5 * 60 * 1000) {
    progressMap.delete(websiteId);
    return undefined;
  }
  return progress;
}

export function clearProgress(websiteId: string): void {
  progressMap.delete(websiteId);
}

export function getAllProgress(): ProgressUpdate[] {
  const allProgress: ProgressUpdate[] = [];
  progressMap.forEach((progress) => {
    // Skip old progress entries
    if (Date.now() - progress.timestamp <= 5 * 60 * 1000) {
      allProgress.push(progress);
    } else {
      progressMap.delete(progress.websiteId);
    }
  });
  return allProgress;
}
