/**
 * @description: 处理自定义属性
 * @return {*}
 */
export function patchAttribute(
  ele: Element,
  key: string,
  nextValue: string | null
) {
  if (nextValue === null) {
    ele.removeAttribute(key);
  } else {
    ele.setAttribute(key, nextValue);
  }
}
