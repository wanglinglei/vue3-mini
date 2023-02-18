export interface IRenderOptionDOM {
  // 创建dom节点
  createElement: (tag: string) => HTMLElement;
  // 移除节点
  remove: (child: Element) => void;
  // 插入节点  anchor 插入锚点 不传直接追加
  insert: (
    child: Element | Node,
    parent: Element,
    anchor?: Element | null
  ) => void;
  // 查找节点
  querySelector: (selector: string) => Element | null;
  // 设置文本
  setElementText: (ele: Element, text: string) => void;
  // 创建文本节点
  createContentText: (text: any) => Text;
  // 设置文本节点值
  setText: (node: { nodeValue: any }, text: any) => void;
  // 设置props
  patchProps: (
    ele: Element,
    key: string,
    prevValue: any,
    nextValue: any
  ) => void;
  parentNode: (child: Element) => ParentNode | null;
}

// 虚拟dom对象
export interface IVnode {
  _isVnode: boolean;
  props: Record<string, any>;
  type: any;
  key: string;
  children: any[] | string;
  el: any;
  shapeFlag: number;
  component: any;
  componentInstance?: IComponentInstance;
}

// 组件实例对象
export interface IInstanceCtx {
  _: IComponentInstance | undefined;
}
export interface IComponentInstance {
  vnode: IVnode;
  subTree: TPatchN;
  props: Record<string, any>; // 组件的属性
  attrs: Record<string, any>; // attrs
  setupState: Record<string, any>;
  ctx: IInstanceCtx; //处理代理
  proxy: object;
  isMounted: boolean; // 是否挂载过
  children: any[] | string;
  type: any;
  slots?: any[];
  emit?: () => void;
  expose?: () => void;
  render?: (ctx: any) => IVnode;
  bm?: THook;
  m?: THook;
  bu?: THook;
  u?: THook;
}

export type TPatchN = null | IVnode;

export type TElementProps = Record<string, any>;

export const enum lifeCycle {
  BEFORE_MOUNT = "bm",
  MOUNTED = "m",
  BEFORE_UPDATE = "bu",
  UPDATED = "u",
}

export type THook = (() => void)[];
