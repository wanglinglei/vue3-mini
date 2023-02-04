<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Vue3-mini](#vue3-mini)
  - [description](#description)
  - [项目目录](#%E9%A1%B9%E7%9B%AE%E7%9B%AE%E5%BD%95)
  - [reactive 响应式](#reactive-%E5%93%8D%E5%BA%94%E5%BC%8F)
    - [vue2与vue3响应式的区别](#vue2%E4%B8%8Evue3%E5%93%8D%E5%BA%94%E5%BC%8F%E7%9A%84%E5%8C%BA%E5%88%AB)
    - [核心逻辑](#%E6%A0%B8%E5%BF%83%E9%80%BB%E8%BE%91)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## Vue3-mini 
***
### description
参考Vue3源码，实现最简Vue3模型

### 项目目录

> vue3-mini
>>--packages  各模块包
>>>-  reactive  响应式模块
>>>>- dist 打包之后的文件 包含cjs、esm-bundler、global 三种文件模式
>>>>- example 实例
>>>-  shared    工具函数
>>>>- dist 打包之后的文件 包含cjs、esm-bundler、global 三种文件模式
>
>>--scripts  构建相关脚本
>
>>-- rollup.config  rollup 打包配置

### reactive 响应式

#### vue2与vue3响应式的区别
vue2实现响应式是通过Object.defineProperty来劫持对象中的每一个属性的set、get,而vue3 是通过Proxy创建代理对象,来拦截所有对象的操作。vue3相对于vue2来说性能更高,vue3中的响应式是懒响应,只有对象中被访问的属性才会被依赖收集;而vue中是递归遍历对象中所有属性,为其创建watcher实例,以监听数据的变化。

#### 核心逻辑
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