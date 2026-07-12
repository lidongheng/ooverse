import { onUnmounted } from "vue";

export const useSetInterval = (fetchFunction) => {
  const interval = setInterval(fetchFunction, 5 * 60 * 1000);
  onUnmounted(() => {
    clearTimeout(interval);
  });
};
