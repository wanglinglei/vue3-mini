import { IComponentInstance, IInstanceCtx } from "./types";

import { hasOwn } from "@vue/shared";
import { track, trigger, TriggerType } from "@vue/reactivity";

export const componentPublicInstance = {
  // target {_:instance}
  get({ _: instance }: IInstanceCtx, key: string) {
    const { props, setupState } = instance as IComponentInstance;
    if (key[0] == "$") return;
    if (hasOwn(props, key)) {
      return props[key];
    } else if (hasOwn(setupState, key)) {
      return setupState[key];
    }
  },
  set({ _: instance }: IInstanceCtx, key: string, newVal: any) {
    const { props, setupState } = instance as IComponentInstance;

    if (hasOwn(props, key)) {
      props[key] = newVal;
    } else if (hasOwn(setupState, key)) {
      setupState[key] = newVal;
    }
    return true;
  },
};
