import {isObject} from '@vue/shared'

import {reactiveHandler,readOnlyHandler,shallowReactiveHandler,shallowReadOnlyHandler} from './baseHandler'
export function reactive(target:unknown) {
  return createReactive(target, false, reactiveHandler)
}

export function readOnly(target:unknown)  {
  return createReactive(target,true, readOnlyHandler)
}

export function reactiveShallow(target:unknown) {
  return createReactive(target,false, shallowReactiveHandler)
}

export function readOnlyShallow(target:unknown) {
  return createReactive(target, true, shallowReadOnlyHandler)
}


const reactivityMap = new Map
const readOnlyMap = new Map


// 创建响应式函数
function createReactive(target: unknown, isReadOnly: boolean = false,baseHandler: object) {
  
  if (!isObject(target)) {
    console.warn(`${target} is not an object`);
    return
  }

  const proxyMap = isReadOnly ? readOnlyMap : reactivityMap
  const existTarget = proxyMap.get(target)
  
  if (existTarget) {
    return  existTarget
  }
  
  const proxy = new Proxy(target, baseHandler)
  proxyMap.set(target, proxy)
  return proxy
}