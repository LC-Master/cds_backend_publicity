import { CONFIG } from "@src/config/config";
import { logger } from "@src/providers/logger.provider";

const toMb = (value: number) => Number((value / 1024 / 1024).toFixed(2));

export const getMemorySnapshot = () => {
  const usage = process.memoryUsage();
  return {
    rssMb: toMb(usage.rss),
    heapTotalMb: toMb(usage.heapTotal),
    heapUsedMb: toMb(usage.heapUsed),
    externalMb: toMb(usage.external),
    arrayBuffersMb: toMb(usage.arrayBuffers),
  };
};

export const logMemory = (
  phase: string,
  extra?: Record<string, unknown>
): void => {
  if (!CONFIG.MEMORY_DIAGNOSTICS) return;
  logger.info({
    message: "Memory snapshot",
    phase,
    ...getMemorySnapshot(),
    ...(extra ?? {}),
  });
};

export const runGcIfConfigured = (phase: string): void => {
  if (!CONFIG.ENABLE_GC_AFTER_SYNC) return;
  try {
    Bun.gc(true);
    logMemory(phase);
  } catch (err) {
    logger.warn({
      message: "Post-sync GC failed",
      phase,
      error: (err as Error).message,
    });
  }
};
