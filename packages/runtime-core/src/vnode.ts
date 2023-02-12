// 创建虚拟dom 和 h() 函数作用一样  需要区分是元素还是组件
import { IVnode } from "./types";

import { isString, ShapeFlags, isObject, isArray } from "@vue/shared";

/**
 * @description: 创建虚拟dom
 * @param {any} type  类型
 * @param {any} props  属性
 * @param {*} children  子元素
 * @return {*}
 */
export function createVnode(
  type: any,
  props: any,
  children: any[] | string = ""
) {
  // 标识类型
  let shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONENT
    : 0;
  const vnode: IVnode = {
    _isVnode: true,
    props,
    type,
    key: props?.key, //添加key diff
    children,
    el: null, // 和真实元素对应
    shapeFlag,
    component: {},
  };
  // 添加子元素标识
  normalizesChildren(vnode, children);

  return vnode;
}

function normalizesChildren(vnode: IVnode, children: any) {
  let type = 0;
  if (children) {
    if (isArray(children)) {
      type = ShapeFlags.ARRAY_CHILDREN;
    } else {
      type = ShapeFlags.TEXT_CHILDREN;
    }
  }
  vnode.shapeFlag = vnode.shapeFlag | type;
}

/**
 * @description: 是否为虚拟dom
 * @param {object} int
 * @return {*}
 */
export function isVnode(int: object): boolean {
  return (int as IVnode)._isVnode;
}

export const TEXT = Symbol("text");

/**
 * @description: 子元素转为虚拟dom
 * @param {string} child
 * @return {*}
 */
export function CVnode(child: string | IVnode): IVnode {
  // [ 'text']  // [h()]
  if (isObject(child)) {
    return child;
  }
  return createVnode(TEXT, null, String(child));
}
