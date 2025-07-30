// Simple module cache - no aggressive preloading
class SimpleModuleCache {
  private cache = new Map<string, React.ComponentType<any>>();
  private loadingPromises = new Map<string, Promise<any>>();

  async loadModule(moduleId: string) {
    if (this.cache.has(moduleId)) {
      return this.cache.get(moduleId);
    }

    if (this.loadingPromises.has(moduleId)) {
      return this.loadingPromises.get(moduleId);
    }

    const loadPromise = import(`@/components/ai-modules/${moduleId}.tsx`)
      .then(module => {
        this.cache.set(moduleId, module.default);
        this.loadingPromises.delete(moduleId);
        return module.default;
      })
      .catch(error => {
        this.loadingPromises.delete(moduleId);
        throw error;
      });

    this.loadingPromises.set(moduleId, loadPromise);
    return loadPromise;
  }

  getComponent(moduleId: string): React.ComponentType<any> | null {
    return this.cache.get(moduleId) || null;
  }

  isReady(moduleId: string): boolean {
    return this.cache.has(moduleId);
  }
}

export const moduleCache = new SimpleModuleCache();