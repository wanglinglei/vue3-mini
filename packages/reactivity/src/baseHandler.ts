import { isObject,isArray } from '@vue/shared'
import { TrackType, TriggerType } from './operatonType'
import { reactive, readOnly } from './reactivity'



function createGetter(isReadOnly:boolean=false,isShallow:boolean=false) {
  return function get(target:object, key:string, receiver:object) {
    const value = Reflect.get(target, key, receiver)
    if (!isReadOnly) {
      // 依赖收集
    }
    if (isShallow) {
      return value
    }
    // @note  和vue2相比做了性能优化 vue2在初始化阶段递归遍历对象属性做依赖收集
    //        vue3 只会对访问到的属性做依赖收集
    if (isObject(value)) {
      return isReadOnly ? readOnly(value) : reactive(value)
    }

    return value
  }
}

function createSetter(isShallow: boolean = false) {
  return function set(target:object, key:string|symbol, receiver:object) {
    const oldVal = (target as any)[key]
    const newVal=Reflect.set(target,key,receiver)
    let kadKey
    if (isArray(target)) {
      
    }
    return newVal
  }
}


const get=createGetter()
const set = createSetter()

const readOnlyGet = createGetter(true)

const shallowReactiveGet = createGetter(false, true)
const shallowReactiveSet = createSetter(true)

const shallowReadOnlyGet = createGetter(true, true)

export const reactiveHandler = {
  set,
  get
}
export const readOnlyHandler = {
  readOnlyGet,
  set: (target:object,key:string) => {
    console.warn(`${target} is readOnly,can not set`); 
  }
}
export const shallowReactiveHandler = {
  get:shallowReactiveGet,
  set: shallowReactiveSet,
}
export const shallowReadOnlyHandler = {
  get: shallowReadOnlyGet,
  set: (target:object,key:string) => {
    console.warn(`${target} is readOnly,can not set value`); 
  }
}