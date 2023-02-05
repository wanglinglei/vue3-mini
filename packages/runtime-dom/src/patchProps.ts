// patchProps 对属性的操作
import { patchAttribute } from "./modules/attr";
import { patchClass } from "./modules/class";
import { patchEvent } from "./modules/event";
import { patchStyle } from "./modules/style";
export function patchProps(
  ele: Element,
  key: string,
  prevValue: any,
  nextValue: any
) {
  switch (key) {
    case "class":
      patchClass(ele, nextValue);
      break;
    case "style":
      patchStyle(ele, prevValue, nextValue);
      break;
    default:
      if (/^on[^Z-a]/.test(key)) {
        patchEvent(ele, key, nextValue);
      } else {
        patchAttribute(ele, key, nextValue);
      }
      break;
  }
}
