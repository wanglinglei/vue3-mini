import { isArray, isIntegerKey } from "@vue/shared";
import {
  TEffect,
  IEffectOptions,
  TKey,
  TDepMap,
  TTriggerType,
  TDep,
} from "./type";
import { TrackType, TriggerType } from "./operationType";
// 当前激活的副作用函数
let activeEffect: undefined | TEffect;

// 副作用函数存储桶
//  targetMap  -> WeakMap
//      - target -> Map
//      - key    -> Set
let targetMap: WeakMap<any, TDepMap | undefined> = new WeakMap();

/**
 * @description: 依赖收集函数
 * @param {object} target
 * @param {*} key
 * @return {*}
 */
export function track(target: object, key: TKey) {
  if (!activeEffect) return;
  let depMap = targetMap.get(target);
  if (!depMap) {
    targetMap.set(target, (depMap = new Map()));
  }
  let dep = depMap.get(key);
  if (!dep) {
    depMap.set(key, (dep = new Set()));
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
  }
}

/**
 * @description: 调度副作用函数
 * @param {object} target
 * @param {TKey} key
 * @return {*}
 */
export function trigger(
  target: object,
  key: TKey,
  type: TTriggerType,
  oldValue: any,
  newValue: any
) {
  let depMap = targetMap.get(target);
  if (!depMap) {
    return;
  }

  // 解决副作用函数重复调用问题 定义Set结构
  let effectSet: TDep = new Set();
  const add = (effects: TDep | undefined) => {
    if (effects) {
      effects.forEach((effect) => {
        effectSet.add(effect);
      });
    }
  };
  add(depMap.get(key));

  // 处理数组 修改数组length
  if (key === "length" && isArray(target)) {
    depMap.forEach((effects, key) => {
      // 修改的length小于当前length  取出被删掉的元素对应的effect 执行
      if (key === "length" && key >= newValue) {
        add(effects);
      }
    });
  } else {
    // 对象
    if (key !== undefined) {
      add(depMap.get(key));
    } else {
      // 判断具体操作类型
      switch (type) {
        case TriggerType.ADD:
          if (isArray(target) && isIntegerKey(key)) {
            add(depMap.get("length"));
          }
          break;

        default:
          break;
      }
    }
  }
  effectSet.forEach((effect) => {
    effect();
  });
}

// 副作用函数栈 用以解决副作用函数嵌套问题
//  effect(()=>{
//    obj.a             effect1
//    effect(()=>{
//      obj.b           effect2
//    });
//    obj.c             effect1
// })

let effectStack: TEffect[] = [];

/**
 * @description:
 * @param {void} fn
 * @param {IEffectOptions} options
 * @return {*}
 */
function effect(fn: void, options: IEffectOptions = {}) {
  const effect = createEffect(fn, options);
  if (!options.lazy) {
    effect();
  }
  return effect;
}

function createEffect(fn: void, options: IEffectOptions = {}): TEffect {
  const effect = function reactiveEffect() {
    if (!effectStack.includes(effect)) {
      try {
        activeEffect = effect;
        effectStack.push(effect);
      } finally {
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1];
      }
    }
  };
  effect._isEffect = true;
  effect.options = options;
  effect.raw = fn;
  return effect;
}
