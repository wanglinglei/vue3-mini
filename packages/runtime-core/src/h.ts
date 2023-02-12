import { isArray, isObject } from "@vue/shared";
import { createVnode, isVnode } from "./vnode";

/**
 * @description: 创建虚拟dom
 * @param {string} tag
 * @param {object} propsOrChildren
 * @param {null} children
 * @return {*}
 */
export function h(
  tag: string,
  propsOrChildren: object,
  children: null | any = null
) {
  // 判断参数
  const len = arguments.length;
  // 只有前两个参数的情况
  if (len === 2) {
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      // h('div',{})
      if (isVnode(propsOrChildren)) {
        // h('div',h('div'))
        return createVnode(tag, null, [propsOrChildren]);
      }
      // 没有子节点
      return createVnode(tag, propsOrChildren);
    } else {
      return createVnode(tag, null, propsOrChildren);
    }
  } else {
    // h('div',{},'1','2','3')
    if (len > 3) {
      children = Array.prototype.slice.call(arguments, 2);
    } else if (len === 3 && isVnode(children)) {
      children = [children];
    }
    return createVnode(tag, propsOrChildren, children);
  }
}

// h 函数的几种形式
// h('div','hello')
// h('div',{})
// h children
// h('div',{},'hello')
// h('div',{},['world'])
// h('div',{},[h('div')]
