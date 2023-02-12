import { ShapeFlags } from "@vue/shared";
import { effect } from "@vue/reactivity";
import { IComponentInstance, IRenderOptionDOM, IVnode, TPatchN } from "./types";

import { createAppApi } from "./apiCreateApp";

import { createComponentInstance, setupComponent } from "./component";
import { CVnode, TEXT } from "./vnode";
/**
 * @description: 创建渲染方法
 * @param {IRenderOptionDOM} renderOptionDOM
 * @return {*}
 */
export function createRender(renderOptionDOM: IRenderOptionDOM) {
  const {
    insert,
    remove,
    createElement,
    createContentText,
    setText,
    setElementText,
    parentNode,
    patchProps,
  } = renderOptionDOM;
  /**
   * @description: 核心渲染方法 比对新老节点
   * @param {*} n1 老节点 初始化阶段wei null
   * @param {*} n2 新节点
   * @param {*} container  节点挂载的容器
   * @return {*}
   */
  const patch = (n1: TPatchN, n2: TPatchN, container: HTMLElement) => {
    if (n2 === null) return;
    let { shapeFlag, type } = n2;
    console.log(
      "patch",
      shapeFlag & ShapeFlags.ELEMENT,
      shapeFlag & ShapeFlags.STATEFUL_COMPONENT
    );
    switch (type) {
      case TEXT:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 是元素
          processElement(n1, n2, container);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 组件
          processComponent(n1, n2, container);
        }
    }
  };

  /** 文本方法 */
  /**
   * @description: 处理文本
   * @param {TPatchN} n1
   * @param {TPatchN} n2
   * @param {HTMLElement} containder
   * @return {*}
   */
  const processText = (n1: TPatchN, n2: TPatchN, container: HTMLElement) => {
    if (n1 === null) {
      if (n2) {
        const text = (n2.el = createContentText(n2?.children));
        insert(text, container);
      }
    }
  };

  /**   元素方法  */
  /**
   * @description: 处理元素
   * @param {TPatchN} n1
   * @param {TPatchN} n2
   * @param {HTMLElement} container
   * @return {*}
   */
  const processElement = (n1: TPatchN, n2: TPatchN, container: HTMLElement) => {
    if (n1 === null) {
      mountElement(n2, container);
    }
  };

  /**
   * @description:
   * @param {TPatchN} n2
   * @param {HTMLElement} container
   * @return {*}
   */
  const mountElement = (n2: TPatchN, container: HTMLElement) => {
    // 递归渲染 =>dom 操作 => 渲染到指定位置
    if (n2) {
      const { shapeFlag, type, props, children } = n2;
      // 创建真实的dom节点
      const ele = createElement(type);
      // 添加属性
      if (props) {
        for (const key in props) {
          patchProps(ele, key, null, props[key]);
        }
      }
      // 子元素
      if (children) {
        // 子元素为文本
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
          setElementText(ele, children as string);
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(ele, children as []);
        }
      }
      //插入到对应位置
      insert(ele, container);
    }
  };

  /**
   * @description: 处理子元素
   * @param {HTMLElement} ele
   * @param {any} children
   * @return {*}
   */
  const mountChildren = (ele: HTMLElement, children: any[]) => {
    for (let i = 0; i < children.length; i++) {
      const child: IVnode = CVnode(children[i]);
      patch(null, child, ele);
    }
  };
  /**   组件方法  */
  /**
   * @description: 处理组件
   * @param {TPatchN} n1
   * @param {IVnode} n2
   * @param {HTMLElement} container
   * @return {*}
   */
  const processComponent = (
    n1: TPatchN,
    n2: IVnode,
    container: HTMLElement
  ) => {
    if (n1 === null) {
      // 组件首次渲染
      mountComponent(n2, container);
    } else {
      // 组件更新
    }
  };

  /**
   * @description: 组件首次渲染
   * @description: 流程:1.创建一个组件实例对象 2.解析数据到实例对象 3.创建一个effect
   * @param {*} vnode
   * @param {*} container
   * @return {*}
   */
  const mountComponent = (initialVNode: IVnode, container: HTMLElement) => {
    // 创建组件实例对象
    const instance = (initialVNode.componentInstance =
      createComponentInstance(initialVNode));
    // 解析组件数据
    setupComponent(instance);
    // 创建Effect
    setupComponentEffect(instance, container);
  };

  /**
   * @description: 组件渲染effect
   * @param {IComponentInstance} instance
   * @return {*}
   */
  const setupComponentEffect = (
    instance: IComponentInstance,
    container: HTMLElement
  ) => {
    // 创建effect
    if (!instance.isMounted) {
      // 获取到render 返回值
      let proxy = instance.proxy;
      //执行render 创建渲染节点
      //@ts-ignore
      const subTree: TPatchN = instance.render?.call(proxy, proxy);
      console.log("subTree", subTree);
      patch(null, subTree, container);
    }
  };
  let render = (vnode: IVnode, container: HTMLElement) => {
    console.log("createRender-render", vnode);

    patch(null, vnode, container);
  };
  return {
    // 内部创建虚拟dom 调用render 方法渲染
    //@ts-ignore
    createApp: createAppApi(render),
  };
}
