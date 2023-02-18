import { IComponentInstance, lifeCycle, THook } from "./types";

import { getCurrentInstance, setCurrentInstance } from "./component";

//  生命周期
import { currentInstance } from "./component";

export const onBeforeMount = createHook(lifeCycle.BEFORE_MOUNT);
export const onMounted = createHook(lifeCycle.MOUNTED);
export const onBeforeUpdate = createHook(lifeCycle.BEFORE_UPDATE);
export const onUpdated = createHook(lifeCycle.UPDATED);

// 创建生命周期
function createHook(lifeCycle: lifeCycle) {
  return function (cb: Function, target = currentInstance) {
    injectHook(lifeCycle, cb, target as IComponentInstance);
  };
}

function injectHook(
  lifeCycle: lifeCycle,
  cb: Function,
  target: IComponentInstance
) {
  if (!target) return;
  //@ts-ignore
  const hooks = target[lifeCycle] || (target[lifeCycle] = []);
  console.log("target---", target);

  const rap = () => {
    setCurrentInstance(target);
    cb();
    setCurrentInstance(null);
  };
  hooks.push(rap);
}

// 1. 生命周期都在当前组件实例上
// 2. vue3 生命周期要在setup 中使用 在每次调用setup时存一个全局的组件实例
// 3. 在setup 中的生命周期都指向这个实例 执行结束清除

// 生命周期的调用 在对应阶段调用函数

/**
 * @description: s生命周期函数调度
 * @param {THook} invokers
 * @return {*}
 */
export function invokerArray(invokers: THook) {
  invokers.forEach((invoker) => {
    invoker();
  });
}
