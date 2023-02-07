// 创建虚拟dom 和 h() 函数作用一样  需要区分是元素还是组件

interface IVnode {
  _isVnode: boolean;
  props: Record<string, any>;
  type: any;
  key: string;
  children: any[];
  el: any;
  shapeFlag: number;
}

import { isString, ShapeFlags, isObject, isArray } from "@vue/shared";
export function createVnode(type: any, props: any, children = null) {
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
    children: [],
    el: null, // 和真实元素对应
    shapeFlag,
  };
  // 添加子元素标识
  normalizesChildren(vnode, children);
  console.log("createVnode", vnode);

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
