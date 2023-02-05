/**
 * @description: 处理Dom class
 * @param {Element} ele
 * @param {string} nextValue
 * @return {*}
 */
export function patchClass(ele: Element, nextValue: string | null) {
  if (nextValue === null) {
    nextValue = "";
  }
  // 有值覆盖 无值赋空
  ele.className = nextValue;
}
