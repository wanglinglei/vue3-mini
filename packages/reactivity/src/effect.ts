import { TEffect, IEffectOptions, TKey, TDepMap } from "./type";

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
export function trigger(target: object, key: TKey) {}

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
