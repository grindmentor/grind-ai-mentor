// Simple, efficient loading hook
export const useInstantLoading = () => {
  return {
    isShellReady: true,
    trackInteraction: () => {},
    warmupRoute: () => {}
  };
};