<template>
  <div class="ring-ratio" :class="{ small: small, 'no-color': noColor }" v-show="data !== null || data !== ''">
    <div class="ratio-text">
      <slot name="text">{{ lable }}</slot>
    </div>
    <div class="arrow-icon" :class="arrowClass" v-if="showArrow"></div>
    <div :class="[ 'ring-value', textClass ]">{{ getText(data) }}{{ unit === '%' ? '%' : '' }}</div>
    <div class="ratio-text">
      <slot name="unit"></slot>
    </div>
  </div>
</template>

<script setup>
import { floatToNumber, numberToENUS } from '@shared/business/formatFunction.js';
import { computed } from 'vue';

const props = defineProps({
  lable: {
    type: String,
    default: '环比',
  },
  unit: {
    type: String,
    default: '%',
  },
  data: {
    type: [Number, String],
    default: 0,
  },
  upGreen: {
    type: Boolean,
    default: true,
  },
  showArrow: {
    type: Boolean,
    default: true,
  },
  small: {
    type: Boolean,
    default: false,
  },
  noColor: {
    type: Boolean,
    default: false,
  },
  ratioFixed: {
    type: Number,
    default: 2,
  },
});

const arrowClass = computed(() => {
  if (!props.data) {
    const direction = Number(props.data) > 0 ? 'up' : 'down';
    let color = "";
    if (props.upGreen) {
      color = direction === 'up' ? 'green' : 'red';
    } else {
      color = direction === 'up' ? 'red' : 'green';
    }
    return `arrow-${direction}-${color}`;
  } else {
    const direction = props.upGreen ? 'up' : 'down';
    const color = 'green';
    return `arrow-${direction}-${color}`;
  }
});

const textClass = computed(() => {
  if (!props.data) {
    const direction = Number(props.data) > 0 ? 'up' : 'down';
    let color = "";
    if (props.upGreen) {
      color = direction === 'up' ? 'green' : 'red';
    } else {
      color = direction === 'up' ? 'red' : 'green';
    }
    return color;
  }
  return 'green';
});

const getText = (values) => {
  if(['**', '--'].includes(values)) {
    return values;
  }
  let value = Math.abs(values);
  return numberToENUS(floatToNumber(value, props.ratioFixed), props.ratioFixed);
};
</script>

<style scoped lang="less">
.ring-ratio {
  display: flex;
  align-items: baseline;
  gap: 2px;
  &.small {
    .ratio-text {
      font-size: 12px;
      .ring-value {
        font-size: 14px;
      }
    }
  }
  .ratio-text {
    font-size: 14px;
    color: rgba(113, 113, 168, 1);
    margin-right: 2px;
    white-space: nowrap;
  }
}
.green {
  color: #1bcc8e;
}
.red {
  color: #f55b5b;
}
.ring-value {
  font-family: Microsoft YaHei;
  font-size: 14px;
  font-weight: 700;
  line-height: 18px;
  letter-spacing: 0px;
  text-align: left;
}

.arrow-up-green {
  background: url('../assets/arrow-up-green.svg');
}

.arrow-up-red {
  background: url('../assets/arrow-up-red.svg');
}

.arrow-down-green {
  background: url('../assets/arrow-up-green.svg');
  transform: scaleY(-1);
}

.arrow-down-red {
  background: url('../assets/arrow-up-red.svg');
  transform: scaleY(-1);
}

.arrow-icon {
  width: 10px;
  height: 10px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.no-color {
    .ring-value {
        color: rgba(51, 51, 107, 1) !important;
    }
    .arrow-icon {
        filter: grayscale(1) brightness(0.4);
    }
}

</style>
