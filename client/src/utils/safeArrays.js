// Utility functions to safely handle arrays and prevent undefined errors

export const safeArray = (arr) => {
  return Array.isArray(arr) ? arr : [];
};

export const safeLength = (arr) => {
  return Array.isArray(arr) ? arr.length : 0;
};

export const safeFilter = (arr, filterFn) => {
  return Array.isArray(arr) ? arr.filter(filterFn) : [];
};

export const safeMap = (arr, mapFn) => {
  return Array.isArray(arr) ? arr.map(mapFn) : [];
};

export const safeFind = (arr, findFn) => {
  return Array.isArray(arr) ? arr.find(findFn) : undefined;
};

export const safeSome = (arr, someFn) => {
  return Array.isArray(arr) ? arr.some(someFn) : false;
};

export const safeEvery = (arr, everyFn) => {
  return Array.isArray(arr) ? arr.every(everyFn) : true;
};

export const safeReduce = (arr, reduceFn, initialValue) => {
  return Array.isArray(arr) ? arr.reduce(reduceFn, initialValue) : initialValue;
};

export const safeSlice = (arr, start, end) => {
  return Array.isArray(arr) ? arr.slice(start, end) : [];
};

export const safeSortBy = (arr, sortFn) => {
  return Array.isArray(arr) ? [...arr].sort(sortFn) : [];
};