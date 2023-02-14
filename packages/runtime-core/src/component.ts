import { isFunction, isObject, ShapeFlags } from "@vue/shared";
import { IVnode, IComponentInstance } from "./types";
import { componentPublicInstance } from "./componentPublicInstance";
import { idText } from "typescript";

/**
 * @description:  创建组件实例
 * @param {IVnode} vnode
 * @return {*}
 */
export function createComponentInstance(vnode: IVnode): IComponentInstance {
  const instance: IComponentInstance = {
    vnode,
    subTree: null,
    type: vnode.type,
    props: {}, // 组件的属性
    attrs: {}, // attrs
    setupState: {},
    ctx: { _: undefined }, //处理代理
    proxy: {},
    isMounted: false, // 是否挂载过,
    children: [],
  };
  instance.ctx = { _: instance };
  return instance;
}

/**
 * @description: 解析数据刅组件实例
 * @param {IComponentInstance} instance
 * @return {*}
 */
export function setupComponent(instance: IComponentInstance) {
  const { props, children } = instance.vnode;
  instance.props = props;
  instance.children = children;
  // 是否是有状态的组件 setup
  let shapeFlag = instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT;
  if (shapeFlag) {
    // 有状态组件
    setupStateComponent(instance);
  }
}

function setupStateComponent(instance: IComponentInstance) {
  instance.proxy = new Proxy(instance.ctx, componentPublicInstance);

  // 获取组件的类型 拿到组件setup方法
  let Component = instance.type;
  let { setup, render } = Component;

  if (setup) {
    // 处理setup 参数   setup  返回值两种情况  1.对象 合并到组件实例state  2.函数 =》render
    let setupContext = createContext(instance);
    let setupResult = setup(instance.props, setupContext);
    handleSetupResult(instance, setupResult);
    componentRender(instance);
  } else {
    //   返回值是render函数的参数 调用render
  }
}

/**
 * @description: 调用render函数
 * @description: 判断组件实例上是否有render 1. 没有render 模板编译
 * @param {IComponentInstance} instance
 * @return {*}
 */
function componentRender(instance: IComponentInstance) {
  let Component = instance.type;
  if (!instance.render) {
    if (!Component.render && Component.template) {
      //todo : template compare
    }
    instance.render = Component.render;
  }
}

function createContext(instance: IComponentInstance) {
  return {
    attrs: instance.attrs,
    slots: instance.slots,
    emit: () => {},
    expose: () => {},
  };
}

/**
 * @description: 处理setup 返回值
 * @description: 如果setup 返回的render函数 保存到组件实例;是对象则合并到组件state
 * @param {IComponentInstance} instance
 * @param {any} setupResult
 * @return {*}
 */
function handleSetupResult(instance: IComponentInstance, setupResult: any) {
  if (isFunction(setupResult)) {
    // 如果setup 返回的render函数 保存到组件实例
    instance.render = setupResult;
  } else if (isObject(setupResult)) {
    instance.setupState = setupResult;
  }
}
