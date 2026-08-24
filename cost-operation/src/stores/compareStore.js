import { ref } from 'vue';
import { defineStore } from 'pinia';
import router from '@/router';
import { ElMessage } from 'element-plus';

export const useCompareStore = defineStore('compare', () => {
  // 对比组，最多4个
  const compareList = ref([]);

  // 显示操作列
  const showCompare = ref(false);

  // 点击PK对比，第一次点显示操作列，第二次点跳转到对比页
  const onCompareClick = () => {
    if (!showCompare.value) {
      showCompare.value = true;
    } else {
      if (!compareList.value.length) {
        ElMessage({
          customClass: 'center-message',
          message: '至少加入1个对比',
          type: 'warning',
        });
      } else {
        router.push('/resourcePoolCompare');
      }
    }
  };

  const addToCompare = (row) => {
    if (!row.compare) {
      if (compareList.value.length === 4) {
        ElMessage({
          customClass: 'center-message',
          message: '最多加入4个对比',
          type: 'warning',
        });
      } else {
        compareList.value.push(row);
      }
    } else {
      compareList.value = compareList.value.filter((item) => item.realName !== row.realName);
    }
  };

  const delCompare = (index) => {
    compareList.value.splice(index, 1);
  };
  
  const reset = () => {
    compareList.value = [];
    showCompare.value = false;
  };
  
  return {
    compareList,
    showCompare,
    onCompareClick,
    addToCompare,
    delCompare,
    reset,
  };
});