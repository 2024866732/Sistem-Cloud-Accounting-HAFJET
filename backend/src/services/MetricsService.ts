export interface MetricsSnapshot {
  counters: Record<string, number>;
  generatedAt: string;
}

class MetricsServiceClass {
  private counters: Record<string, number> = Object.create(null);

  inc(name: string, by: number = 1) {
    if (!Number.isFinite(by)) return;
    this.counters[name] = (this.counters[name] || 0) + by;
  }

  set(name: string, value: number) {
    this.counters[name] = value;
  }

  get(name: string): number { return this.counters[name] || 0; }

  reset(name?: string) {
    if (name) delete this.counters[name]; else this.counters = Object.create(null);
  }

  snapshot(): MetricsSnapshot {
    return { counters: { ...this.counters }, generatedAt: new Date().toISOString() };
  }
}

export const MetricsService = new MetricsServiceClass();
export default MetricsService;
