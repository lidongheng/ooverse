import { ref } from "vue";
import { useRegionData } from "./useRegionData";

const selectedRegion = ref(null);
let regionState = null;

function getRegionState() {
  if (!regionState) {
    regionState = useRegionData();
  }
  return regionState;
}

export function useHomeOverview() {
  const state = getRegionState();

  function formatDisplayValue(val) {
    if (state.error.value) return "**";
    if (val == null) return "--";
    return String(val);
  }

  function formatRate(rate) {
    if (state.forbidden.value) return "**";
    const displayValue = formatDisplayValue(rate);
    if (displayValue === "--" || displayValue === "**") {
      return displayValue;
    }
    return `${displayValue}%`;
  }

  function getMarkerColor(rate) {
    if (rate == null) return "#999";
    return rate < 0 ? "#e4453f" : "#2bc595";
  }

  return {
    ...state,
    selectedRegion,
    formatDisplayValue,
    formatRate,
    getMarkerColor,
  };
}
