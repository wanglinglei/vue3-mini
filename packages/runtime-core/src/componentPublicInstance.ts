import { IComponentInstance, IInstanceCtx } from "./types";

import { hasOwn } from "@vue/shared";

export const componentPublicInstance = {
  // target {_:instance}
  get({ _: instance }: IInstanceCtx, key: string) {
    const { props, setupState } = instance as IComponentInstance;
    if (hasOwn(props, key)) {
      return props[key];
    } else if (hasOwn(setupState, key)) {
      return setupState[key];
    }
  },
  set({ _: instance }: IInstanceCtx, key: string, newVal: any) {
    return true;
  },
};
