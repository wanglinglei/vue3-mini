import {
  isObject,
  isArray,
  isIntegerKey,
  hasOwn,
  isEqualValue,
} from "@vue/shared";
import { TrackType, TriggerType } from "./operationType";
import { reactive, readOnly } from "./reactivity";
import { track, trigger } from "./effect";

function createGetter(isReadOnly: boolean = false, isShallow: boolean = false) {
  return function get(target: object, key: string, receiver: object) {
    const value = Reflect.get(target, key, receiver);
    if (!isReadOnly) {
      // 依赖收集
      track(target, key);
    }
    if (isShallow) {
      return value;
    }
    // @note  和vue2相比做了性能优化 vue2在初始化阶段递归遍历对象属性做依赖收集
    //        vue3 只会对访问到的属性做依赖收集
    if (isObject(value)) {
      return isReadOnly ? readOnly(value) : reactive(value);
    }

    return value;
  };
}

function createSetter(isShallow: boolean = false) {
  return function set(
    target: object,
    key: string,
    newValue: any,
    receiver: object
  ) {
    const oldVal = (target as any)[key];
    // 1.判断是数组还是对象   2.类型 添加or修改
    let hadKey;
    if (isArray(target)) {
      if (isIntegerKey(key)) {
        hadKey = Number(key) < (target as []).length;
      }
    } else {
      hadKey = hasOwn(target, key);
    }
    const res = Reflect.set(target, key, newValue, receiver);
    if (!res) return;
    if (!hadKey) {
      // 新增
      trigger(target, key, TriggerType.ADD, newValue);
    } else {
      // 修改 比较新旧值是否相等
      if (!isEqualValue(oldVal, newValue)) {
        trigger(target, key, TriggerType.SET, newValue);
      }
    }

    return newValue;
  };
}

const get = createGetter();
const set = createSetter();

const readOnlyGet = createGetter(true);

const shallowReactiveGet = createGetter(false, true);
const shallowReactiveSet = createSetter(true);

const shallowReadOnlyGet = createGetter(true, true);

export const reactiveHandler = {
  set,
  get,
};
export const readOnlyHandler = {
  readOnlyGet,
  set: (target: object, key: string) => {
    console.warn(`${target} is readOnly,can not set`);
  },
};
export const shallowReactiveHandler = {
  get: shallowReactiveGet,
  set: shallowReactiveSet,
};
export const shallowReadOnlyHandler = {
  get: shallowReadOnlyGet,
  set: (target: object, key: string) => {
    console.warn(`${target} is readOnly,can not set value`);
  },
};
