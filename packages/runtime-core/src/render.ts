import { ShapeFlags } from "@vue/shared";
import { effect } from "@vue/reactivity";
import {
  IComponentInstance,
  IRenderOptionDOM,
  IVnode,
  TPatchN,
  TElementProps,
} from "./types";

import { createAppApi } from "./apiCreateApp";

import { createComponentInstance, setupComponent } from "./component";
import { CVnode, TEXT, isSameNode } from "./vnode";
import { invokerArray } from "./lifecycle";
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
   * @param {TPatchN} n1 老节点 初始化阶段wei null
   * @param {TPatchN} n2 新节点
   * @param {HTMLElement} container  节点挂载的容器
   * @param {HTMLElement} anchor 锚点
   * @return {*}
   */
  const patch = (
    n1: TPatchN,
    n2: TPatchN,
    container: HTMLElement,
    anchor: HTMLElement | null = null
  ) => {
    // 判断是否是同一个元素 1:不是替换  2. 是 比对属性 子节点等
    if (n1 && !isSameNode(n1, n2)) {
      unmount(n1);
      n1 = null;
    }
    if (n2 === null) return;
    let { shapeFlag, type } = n2;
    switch (type) {
      case TEXT:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 是元素
          processElement(n1, n2, container, anchor);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 组件
          processComponent(n1, n2, container);
        }
    }
  };

  /**   --------------------------- 文本方法   ---------------------------- */
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

  /** ------------------  元素方法 ------------------  */

  /**
   * @description: 更新元素属性
   * @param {HTMLElement} el
   * @param {TElementProps} oldProps
   * @param {TElementProps} newProps
   * @return {*}
   */
  const patchElementProps = (
    el: HTMLElement,
    oldProps: TElementProps,
    newProps: TElementProps
  ) => {
    // 对比新旧属性
    for (const key in newProps) {
      const prev = oldProps[key];
      const next = newProps[key];
      if (prev !== next) {
        patchProps(el, key, prev, next);
      }
    }

    for (const key in oldProps) {
      if (!(key in newProps)) {
        patchProps(el, key, oldProps[key], "");
      }
    }
  };

  /**
   * @description: 比对子元素
   * @description :四种情况 1. 旧有新没有 2.新有就没有 3. 都有 都为文本  4. 都有 为数组
   * @param {IVnode} n1
   * @param {IVnode} n2
   * @param {HTMLElement} el
   * @return {*}
   */
  const patchChild = (n1: IVnode, n2: IVnode, el: HTMLElement) => {
    const c1 = n1.children;
    const c2 = n2.children;

    // 都为文本
    const prevShapeFlag = n1.shapeFlag;
    const nextShapeFlag = n2.shapeFlag;
    if (nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // @todo 卸载子节点
      setElementText(el, c2 as string);
    } else {
      // 新的为数组
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 新旧都为数组
        patchChildren(c1 as [], c2 as [], el);
      } else {
        // 旧的为文本
        setElementText(el, "");
        mountChildren(el, c2 as string[]);
      }
    }
  };

  /**
   * @description: 子元素diff
   * @param {any} c1
   * @param {any} c2
   * @param {HTMLElement} el
   * @return {*}
   */
  const patchChildren = (c1: IVnode[], c2: IVnode[], el: HTMLElement) => {
    let i = 0,
      len1 = c1.length - 1,
      len2 = c2.length - 1;

    // 先从头部开始比对   1.同一位置比对 元素不同停止/ 某一个数组结束停止
    // old : <div>  <p></p> </div>
    // new : <div>  <p></p>  <div></div>      </div
    while (i <= len1 && i <= len2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameNode(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break;
      }
      i++;
    }

    // 从尾部开始
    while (i <= len1 && i <= len2) {
      const n1 = c1[len1];
      const n2 = c2[len2];
      if (isSameNode(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break;
      }
      len1--;
      len2--;
    }
    console.log("patch-children", i, len1, len2);

    //  1. 旧的数据少 新的数据多  2. 旧的数据多 新的数据少
    if (i > len1) {
      // 旧的数据少 新的数据多
      const nextNode = len2 + 1; // 插入节点的位置
      const anchor = nextNode < c2.length ? c2[nextNode].el : null;
      while (i <= len2) {
        patch(null, c2[i++], el, anchor);
      }
    } else if (i > len2) {
      // 旧的比新的多 删除多余的
      while (i <= len1) {
        unmount(c1[i]);
        i++;
      }
    } else {
      // 中间乱序的情况
      // 对比新旧 分别 找到可以复用的节点  新增的节点  删除的节点
      const s1 = i,
        s2 = i;
      // 中间乱序的元素的元素个数
      const toBePatched = len2 - s2 + 1;
      // 用数组记录新元素的位置
      const indexToBePatched = new Array(toBePatched).fill(0);

      let keyIndexMap = new Map();
      for (let i = s2; i <= len2; i++) {
        const childNode = c2[i];
        keyIndexMap.set(childNode["key"], i);
      }

      // 遍历旧节点

      for (let i = s1; i <= len1; i++) {
        const oldNode = c1[i];
        let newIndex = keyIndexMap.get(oldNode.key);
        if (newIndex === undefined) {
          // 旧的数据在新的数据中没有 删除
          unmount(oldNode);
        } else {
          //新的元素在旧的列表中的位置+1
          indexToBePatched[newIndex - s2] = i + 1;
          // 比对 更新
          patch(oldNode, c2[newIndex], el);
        }
      }

      // 把节点移动到对应位置 添加新节点
      for (let i = toBePatched - 1; i >= 0; i--) {
        // 新增元素的索引
        let currentIndex = i + s2;
        let child = c2[currentIndex];
        // 新增节点的位置 超出最大长度 追加到最后
        let anchor =
          currentIndex + 1 < c2.length ? c2[currentIndex + 1].el : null;
        // 新增的元素 为第一次渲染
        if (indexToBePatched[i] === 0) {
          patch(null, child, el, anchor);
        } else {
          // 不为新增节点 可复用
          insert(child.el, el, anchor);
        }
      }
    }
  };

  /**
   * @description:  更新元素
   * @param {IVnode} n1
   * @param {IVnode} n2
   * @param {HTMLElement} containder
   * @return {*}
   */
  const patchElement = (
    n1: IVnode,
    n2: IVnode,
    container: HTMLElement,
    anchor: HTMLElement | null = null
  ) => {
    let el = ((n2 as IVnode).el = n1.el);
    // 先处理属性
    const oldProps = n1?.props || {};
    const newProps = n2?.props || {};
    patchElementProps(el, oldProps, newProps);

    // 处理子节点
    patchChild(n1, n2, el);
  };
  /**
   * @description: 处理元素
   * @param {TPatchN} n1
   * @param {TPatchN} n2
   * @param {HTMLElement} container
   * @return {*}
   */
  const processElement = (
    n1: TPatchN,
    n2: IVnode,
    container: HTMLElement,
    anchor: HTMLElement | null = null
  ) => {
    if (n1 === null) {
      mountElement(n2, container, anchor);
    } else {
      // 同一个元素更新 比对属性 子元素
      patchElement(n1, n2, container, anchor);
    }
  };

  /**
   * @description:
   * @param {TPatchN} n2
   * @param {HTMLElement} container
   * @return {*}
   */
  const mountElement = (
    n2: TPatchN,
    container: HTMLElement,
    anchor: HTMLElement | null = null
  ) => {
    // 递归渲染 =>dom 操作 => 渲染到指定位置
    if (n2) {
      const { shapeFlag, type, props, children } = n2;
      // 创建真实的dom节点
      const ele = (n2.el = createElement(type));
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
      insert(ele, container, anchor);
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
  /** ----------------------------------  组件方法  --------------------------------- */
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
    effect(function componentEffect() {
      if (!instance.isMounted) {
        console.log("instance", instance);
        //@ts-ignore
        let { bm, m } = instance;
        if (bm) {
          invokerArray(bm);
        }
        // 获取到render 返回值
        let proxy = instance.proxy;

        //执行render 创建渲染节点
        //@ts-ignore
        const subTree: TPatchN = (instance.subTree = instance.render?.call(
          proxy,
          proxy
        ));
        patch(null, subTree, container);
        if (m) {
          invokerArray(m); // 调度onMounted
        }
        instance.isMounted = true;
      } else {
        const { bu, u } = instance;
        bu && invokerArray(bu); //beforeUpdate
        // 组件更新
        let proxy = instance.proxy;
        const preTree = instance.subTree;

        const nextTree = instance.render
          ? instance.render.call(proxy, proxy)
          : null;
        patch(preTree, nextTree, container);
        u && invokerArray(u); // update
      }
    });
  };

  const unmount = (vnode: IVnode) => {
    remove(vnode.el);
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
