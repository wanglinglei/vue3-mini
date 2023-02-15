<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Vue3-mini](#vue3-mini)
  - [description](#description)
  - [项目目录](#%E9%A1%B9%E7%9B%AE%E7%9B%AE%E5%BD%95)
  - [reactive 响应式](#reactive-%E5%93%8D%E5%BA%94%E5%BC%8F)
    - [vue2与vue3响应式的区别](#vue2%E4%B8%8Evue3%E5%93%8D%E5%BA%94%E5%BC%8F%E7%9A%84%E5%8C%BA%E5%88%AB)
    - [核心逻辑](#%E6%A0%B8%E5%BF%83%E9%80%BB%E8%BE%91)
  - [渲染器](#%E6%B8%B2%E6%9F%93%E5%99%A8)
    - [description](#description-1)
    - [runtime-dom](#runtime-dom)
      - [description](#description-2)
    - [runtime-core](#runtime-core)
      - [description](#description-3)
      - [组件的渲染流程](#%E7%BB%84%E4%BB%B6%E7%9A%84%E6%B8%B2%E6%9F%93%E6%B5%81%E7%A8%8B)
        - [1.创建组件的实例对象](#1%E5%88%9B%E5%BB%BA%E7%BB%84%E4%BB%B6%E7%9A%84%E5%AE%9E%E4%BE%8B%E5%AF%B9%E8%B1%A1)
        - [2.解析数据到实例对象](#2%E8%A7%A3%E6%9E%90%E6%95%B0%E6%8D%AE%E5%88%B0%E5%AE%9E%E4%BE%8B%E5%AF%B9%E8%B1%A1)
        - [3.创建组件渲染的effect](#3%E5%88%9B%E5%BB%BA%E7%BB%84%E4%BB%B6%E6%B8%B2%E6%9F%93%E7%9A%84effect)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


# Vue3-mini 
***
## description
参考Vue3源码，实现最简Vue3模型

## 项目目录

> vue3-mini
>>--packages  各模块包
>>>-  reactive  响应式模块
>>>>- dist 打包之后的文件 包含cjs、esm-bundler、global 三种文件模式
>>>>- example 示例
>>>-  shared    工具函数
>>>>- dist 打包之后的文件 包含cjs、esm-bundler、global 三种文件模式
>>>-  runtime-dom  浏览器运行时  浏览器环境dom相关操作方法
>>>>- dist 打包之后的文件 包含esm-bundler、global 两种种文件模式
>>>>- example 示例
>>>-  runtime-core  核心运行时  核心渲染方法
>>>>- dist 打包之后的文件 包含esm-bundler、global 两种种文件模式
>>>>- example 示例
>
>>--scripts  构建相关脚本
>
>>-- rollup.config  rollup 打包配置

## reactive 响应式

### vue2与vue3响应式的区别
vue2实现响应式是通过Object.defineProperty来劫持对象中的每一个属性的set、get,而vue3 是通过Proxy创建代理对象,来拦截所有对象的操作。vue3相对于vue2来说性能更高,vue3中的响应式是懒响应,只有对象中被访问的属性才会被依赖收集;而vue2中是递归遍历对象中所有属性,为其创建watcher实例,以监听数据的变化。

### 核心逻辑
1. 代理对象
  ```javascript
  const data=new Proxy(obj,{
    get(target,key,receiver){
      const res=Reflect.get(target,key,receiver);
      // 依赖收集
      track(target,key);
      return res
    }
    set(target,key,newValue,receiver){
      const res=Reflect.set(target,key,newValue,receiver);
      if(res){
        trigger(target,key)
      }
    }
  })
  ```
2. 依赖收集
```javascript
const targetMap=new WeakMap;
function track(target, key) {
  let depMap = targetMap.get(target);
  if (!depMap) {
    targetMap.set(target, (depMap = new Map()));
  }
  let dep = depMap.get(key);
  if (!dep) {
    depMap.set(key, (dep = new Set()));
  }
  dep.add(activeEffect);
}
```
当从外部访问代理对象数据时，进行依赖收集,创建如下数据结构来存储数据对应的副作用函数
> targetMap      --WeakMap
>>  target1      -- Map
>>>-  key1        -- Set  对应属性关联的副作用函数
>>>-  key2        -- Set
>
>>  target2      -- Map
>>>-  key1        -- Set
>>>-  key2        -- Set

3. 调度副作用函数
```javascript
function trigger(target,key){
  let depMap = targetMap.get(target);
  if(!depMap) return
  let dep = depMap.get(key);
  if(!dep||!dep.length) return
  dep.forEach((effect)=>{
    effect()
  })
}
```

## 渲染器
### description  
Vue3整个渲染器 分为两个模块:runtime-dom(浏览器运行时)和runtime-core(核心运行时).其中runtime-dom中主要是针对于浏览器平台的dom相关的操作方法;runtime-core 是核心渲染方法,其在创建渲染器时需要接收dom相关的操作方法,正因如此通过runtime-core可以很容易实现跨平台,我们只需要为其提供不同平台的dom操作方法.

### runtime-dom
#### description
主要为runtime-code 提供在浏览器平台的dom操作方法

### runtime-core
#### description 
核心渲染方法  patch 比对新旧节点 把虚拟dom  转化真实dom 
```javascript
  const patch = (n1,n2,container,anchor) => {
    // 判断是否是同一个元素 1:不是替换  2. 是 比对属性 子节点等
    if (n1 && !isSameNode(n1, n2)) {
      unmount(n1);
      n1 = null;
    }
    if (n2 === null) return;
    let { shapeFlag, type } = n2;
    switch (type) {
      // 文本
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
```
文本处理方法processText和元素处理方法processElement 逻辑较为简单,可以直接参考源码.
主要梳理一下组件的渲染的方法.
#### 组件的渲染流程
##### 1.创建组件的实例对象

```javascript
  function createComponentInstance(vnode) {
    const instance = {
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
```

##### 2.解析数据到实例对象
```javascript
  function setupComponent(instance) {
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

  function setupStateComponent(instance) {
    instance.proxy = new Proxy(instance.ctx, componentPublicInstance);

    // 获取组件的类型 拿到组件setup方法
    let Component = instance.type;
    let { setup, render } = Component;

    if (setup) {
      let setupContext = createContext(instance);
      let setupResult = setup(instance.props, setupContext);
      handleSetupResult(instance, setupResult);
      componentRender(instance);
    }
  }

  function createContext(instance) {
    return {
      attrs: instance.attrs,
      slots: instance.slots,
      emit: () => {},
      expose: () => {},
    };
  }

  // setup 返回值两种情况 返回的render函数 保存到组件实例;是对象则合并到组件state
  function handleSetupResult(instance, setupResult) {
    if (isFunction(setupResult)) {
      // 如果setup 返回的render函数 保存到组件实例
      instance.render = setupResult;
    } else if (isObject(setupResult)) {
      instance.setupState = setupResult;
    }
  }

  function componentRender(instance: IComponentInstance) {
    let Component = instance.type;
    if (!instance.render) {
      if (!Component.render && Component.template) {
        //todo : template compare
      }
      instance.render = Component.render;
    }
  } 
```

##### 3.创建组件渲染的effect
```javascript
  const setupComponentEffect = (instance,container) => {
    // 创建effect
    effect(function componentEffect() {
      if (!instance.isMounted) {
        // 获取到render 返回值
        let proxy = instance.proxy;

        //执行render 创建渲染节点
        const subTree = (instance.subTree = instance.render?.call(
          proxy,
          proxy
        ));
        patch(null, subTree, container);
        instance.isMounted = true;
      } else {
        // 组件更新
        let proxy = instance.proxy;
        const preTree = instance.subTree;

        const nextTree = instance.render
          ? instance.render.call(proxy, proxy)
          : null;
        patch(preTree, nextTree, container);
      }
    });
  };

```