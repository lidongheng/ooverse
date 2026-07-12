import { computed, ref } from "vue";

export const mode = ref("compute");
export const selectedResourceType = ref("A3");
export const selectedModelType = ref("DS V4");
export const selectedTokenGroup = ref("model");
export const selectedCustomerType = ref("外部");
export const parentName = ref("代次");
export const isCustomer = computed(
  () => 
    selectedResourceType.value.includes('部') ||
    selectedResourceType.value.includes('YW') ||
    parentName.value.includes('客户')
);
