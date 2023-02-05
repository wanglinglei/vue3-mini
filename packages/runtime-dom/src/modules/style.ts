type TStyle = string | Record<string, string | string[]> | null;

import { isString, isArray } from "@vue/shared";

/**
 * @description: 处理Dom style
 * @param {Element} ele
 * @param {TStyle} prevStyle
 * @param {TStyle} nextStyle
 * @return {*}
 */
export function patchStyle(ele: Element, prevStyle: TStyle, nextStyle: TStyle) {
  const style = (ele as HTMLElement).style;
  const isCssString = isString(nextStyle);

  // 对比新老两个对象 添加新增的 移除删除的
  if (nextStyle && !isCssString) {
    for (const key in nextStyle) {
      setStyle(style, key, nextStyle[key]);
    }

    if (prevStyle && !isString(prevStyle)) {
      for (const key in prevStyle) {
        if (nextStyle[key] == null) {
          setStyle(style, key, "");
        }
      }
    }
  } else {
    const currentDisplay = style.display;
    if (isCssString) {
      if (prevStyle !== nextStyle) {
        style.cssText = nextStyle;
      }
    } else if (prevStyle) {
      ele.removeAttribute("style");
    }
  }
}

function setStyle(
  style: CSSStyleDeclaration,
  key: string,
  value: string | string[]
) {
  if (isArray(value)) {
    value.forEach((val) => {
      setStyle(style, key, val);
    });
  } else {
    style[key as any] = value as string;
  }
}
