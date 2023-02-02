export function isArray(val: unknown): val is [] {
  return Array.isArray(val);
}

export function isNumber(val: unknown): val is number {
  return typeof val === "number";
}

export function isString(val: unknown): val is string {
  return typeof val === "string";
}

export function isObject(val: unknown): val is object {
  return typeof val === "object";
}

export function isEqualValue(val1: unknown, val2: unknown): boolean {
  return val1 === val2;
}
export const hasOwnProperty = Object.prototype.hasOwnProperty;
export function hasOwn(target: object, key: any) {
  return hasOwnProperty.call(target, key);
}
// 判断key 是否为整数
export function isIntegerKey(key: unknown): boolean {
  return (
    isString(key) &&
    key !== "NaN" &&
    key[0] !== "-" &&
    "" + parseInt(key, 10) === key
  );
}
