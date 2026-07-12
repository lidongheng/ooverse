import { ref } from "vue";

export const tierFilter = ref(null);
export const tierFilterState = ref(null);

export function getBubbleResourcePoolFilterName(item) {
  return String(item.resourcePoolTotalName ?? "").trim();
}

export function passesBubbleTierFilter(item, config) {
  const sizeValueField = config.sizeValueField ?? "serverNum";
  const sizeValue = Number(item[sizeValueField] ?? item.sizeValue ?? item.serverNum ?? 0);
  const value = Number.isFinite(sizeValue) ? sizeValue : 0;
  const tierIdx = (config.sizeTiers ?? []).findLastIndex((tier) => value > tier.min);
  const normalizedTierIdx = tierIdx >= 0 ? tierIdx : 0;
  return config.tiers?.[normalizedTierIdx] === true;
}

export function passesBubbleResourcePoolFilter(item, resourcePoolNames, shouldFilter) {
  if (!shouldFilter) return true;
  if (!resourcePoolNames.length) return false;

  const targetName = getBubbleResourcePoolFilterName(item);
  return resourcePoolNames.some(
    (name) => targetName.includes(name) || name.includes(targetName)
  );
}

export function createBubbleTierFilter(config) {
  const normalizedConfig = {
    tiers: [...(config.tiers ?? [])],
    sizeTiers: [...(config.sizeTiers ?? [])],
    sizeValueField: config.sizeValueField ?? "serverNum",
    resourcePoolNames: [...(config.resourcePoolNames ?? [])],
    shouldFilterResourcePool: config.shouldFilterResourcePool === true,
  };
  const allChecked = normalizedConfig.tiers.every(Boolean);

  return (item) => {
    return (
      (allChecked || passesBubbleTierFilter(item, normalizedConfig)) &&
      passesBubbleResourcePoolFilter(
        item,
        normalizedConfig.resourcePoolNames,
        normalizedConfig.shouldFilterResourcePool
      )
    );
  };
}

export function buildTierFilter(config) {
  return createBubbleTierFilter(config);
}

export function setBubbleTierFilter(config) {
  tierFilterState.value = {
    ...config,
    tiers: [...(config.tiers ?? [])],
    sizeTiers: [...(config.sizeTiers ?? [])],
    resourcePoolNames: [...(config.resourcePoolNames ?? [])],
  };
  tierFilter.value = createBubbleTierFilter(tierFilterState.value);
  return tierFilter.value;
}

export function clearBubbleTierFilter() {
  tierFilterState.value = null;
  tierFilter.value = null;
}
