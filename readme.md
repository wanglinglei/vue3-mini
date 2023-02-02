<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Vue3-mini](#vue3-mini)
  - [description](#description)
  - [项目目录](#%E9%A1%B9%E7%9B%AE%E7%9B%AE%E5%BD%95)
  - [reactive 响应式](#reactive-%E5%93%8D%E5%BA%94%E5%BC%8F)
    - [vue2与vue3响应式的区别](#vue2%E4%B8%8Evue3%E5%93%8D%E5%BA%94%E5%BC%8F%E7%9A%84%E5%8C%BA%E5%88%AB)

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
    vue2实现响应式是通过Object.defineProperty来劫持对象中的每一个属性的set、get,而vue3 是通过Proxy创建代理对象,来拦截所有对对象的操作。vue3相对于vue2来说性能更高,vue3中的响应式是懒响应,只有对象中被访问的属性才会被依赖收集;而vue中是递归遍历对象中所有的属性,为其创建watcher实例,以监听数据的变化。