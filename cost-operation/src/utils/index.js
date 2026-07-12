const isDef = (value) => {
  return value !== undefined && value !== null;
};

export const cloneDeep = (obj) => {
  if (!isDef(obj)) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => cloneDeep(item));
  }

  if (typeof obj === 'object') {
    const to = {};
    Object.keys(obj).forEach(key => {
      to[key] = cloneDeep(obj[key]);
    });
    return to;
  }

  return obj;
};

export const formatNumToLocalString = (num) => {
  if (num === null || num === undefined) {
    return '--';
  }
  if (Number.isNaN(Number(num))) {
    return num;
  }
  return Number(num).toLocaleString('en-US');
}

export const formatRateValue = (value, fixed = 2) => {
  if (value === '**') {
    return '**';
  }
  if (value === '--') {
    return '--';
  }
  if (value === 0) {
    return 0;
  }
  if (!value) {
    return '--';
  }
  if (window.location.href.indexOf('test') > -1) {
    return (Number(value * Math.random()) * 100).toFixed(fixed);
  } else {
    return (Number(value) * 100).toFixed(fixed);
  }
}

export const processingUnauthorizedData = (objData = {}, value = '**') => {
  Object.keys(objData).forEach((v) => {
    if (objData[v] instanceof Array) {
      objData[v] = [];
    } else {
      objData[v] = value;
    }
  });
  return objData;
}

export const formatterValue = (value, unit, fixed = 2) => {
  if (value === '**') {
    return '**';
  }
  if (value === '--' || (!value && value !== 0)) {
    return '--';
  }
  if (value === 0) {
    return 0;
  }
  if (window.location.href.indexOf('test') > -1) {
    if (!unit) {
      return (Number(value * Math.random())).toFixed(fixed);
    }
    return (Number(value * Math.random()) / unit ?? 1e8).toFixed(fixed);
  } else {
    if (!unit) {
      return Number(value).toFixed(fixed);
    }
    return Number(value / unit ?? 1e8).toFixed(fixed);
  }
}

export const toBillion = (value) => {
  const unit = 1e8;
  return formatterValue(value, unit);
}

export const toWan = (value) => {
  const unit = 10000;
  return formatterValue(value, unit);
}
