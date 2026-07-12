export function buildAzOptionsFromEfficiencyList(list, keys = ["azName", "regionName", "groupKey", "name"]) {
  const map = new Map();
  (list ?? []).forEach((item) => {
    const name = keys.map((key) => item?.[key]).find(Boolean);
    if (!name || map.has(name)) return;
    map.set(name, { label: name, value: name, name });
  });
  return Array.from(map.values());
}

export function buildRegionOptionsFromEfficiencyList(list, keys = ["regionName"]) {
  const map = new Map();
  (list ?? []).forEach((item) => {
    const name = keys.map((key) => item?.[key]).find(Boolean);
    if (!name || map.has(name)) return;
    map.set(name, { label: name, value: name, name });
  });
  return Array.from(map.values());
}
