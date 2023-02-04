import { isArray, isIntegerKey } from "@vue/shared";
import {
  IEffectOptions,
  TKey,
  TDepMap,
  TTriggerType,
  TDep,
  TVoid,
  IEffectAndOPt,
} from "./type";
import { TrackType, TriggerType } from "./operationType";
// 当前激活的副作用函数
let activeEffect: undefined | TVoid;

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
    // 触发更新时配置项中如果有需要调度的方法 执行 比如 计算属性 在设置新值时 重置_dirty状态 以计算新值
    if (effect.options?.schedule) {
      effect.options.schedule();
    } else {
      effect();
    }
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

let effectStack: TVoid[] = [];

/**
 * @description:
 * @param {TVoid} fn
 * @param {IEffectOptions} options
 * @return {*}
 */
export function effect(fn: TVoid, options: IEffectOptions = {}) {
  const effect = createEffect(fn, options);
  if (!options.lazy) {
    effect();
  }
  return effect;
}

function createEffect(fn: TVoid, options: IEffectOptions = {}): IEffectAndOPt {
  let effect = function reactiveEffect() {
    if (!effectStack.includes(effect)) {
      try {
        activeEffect = effect;
        effectStack.push(effect);
        return fn();
      } finally {
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1];
      }
    }
  };
  const _effect: IEffectAndOPt = effect;
  _effect._isEffect = true;
  _effect.options = options;
  _effect.raw = fn;
  return _effect;
}
