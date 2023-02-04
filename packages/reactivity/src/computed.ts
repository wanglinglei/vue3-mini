import { isEqualValue, isFunction } from "@vue/shared";
import { TVoid, IComputedInt, TSetter } from "./type";
import { effect } from "./effect";
/**
 * @description: computed  参数可能为一个函数 也可能为一个对象
 * @param {TVoid | IComputedInt} int
 * @return {*}
 */
export function computed(int: TVoid | IComputedInt) {
  let getter: TVoid, setter: TSetter;
  if (isFunction(int)) {
    getter = int;
    setter = (newValue) => {
      console.warn("current case  can not set value");
    };
  } else {
    getter = int.get;
    setter = int.set;
  }
  return new ComputedRef(getter, setter);
}

class ComputedRef {
  public _dirty = true;
  public _value: any;
  public effect;
  constructor(private getter: TVoid, private setter: TSetter) {
    // 初始不执行  只有使用到computed的值时才执行
    this.effect = effect(getter, {
      lazy: true,
      schedule: () => {
        // 修改数据时执行 以便重新计算新值
        if (!this._dirty) {
          this._dirty = true;
        }
      },
    });
  }
  get value() {
    if (this._dirty) {
      this._value = this.effect();
      this._dirty = false;
    }
    return this._value;
  }
  set value(newValue: any) {
    this.setter(newValue);
  }
}
