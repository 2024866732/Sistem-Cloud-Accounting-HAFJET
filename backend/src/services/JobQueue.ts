export type JobHandler<T = any> = (payload: T) => Promise<void> | void;

interface QueueJob<T=any> { type: string; payload: T; }

/**
 * Minimal in-memory job queue abstraction to prepare for future async processing.
 * Currently executes jobs synchronously (nextTick) to keep existing synchronous flow.
 * When QUEUE_DRIVER=redis (future) this can be swapped to BullMQ or similar without refactoring callers.
 */
class JobQueue {
  private handlers: Map<string, JobHandler[]> = new Map();

  on<T=any>(type: string, handler: JobHandler<T>) {
    const arr = this.handlers.get(type) || [];
    arr.push(handler as JobHandler);
    this.handlers.set(type, arr);
  }

  async enqueue<T=any>(type: string, payload: T) {
    const handlers = this.handlers.get(type) || [];
    // Synchronous immediate execution (simulate microtask scheduling)
    for (const h of handlers) {
      await Promise.resolve().then(() => h(payload));
    }
  }
}

export const jobQueue = new JobQueue();
export default jobQueue;
