import { track, trigger } from "./effect";
import { TrackType, TriggerType } from "./operationType";
import { isArray, isEqualValue } from "@vue/shared";
import { IRef, TRefValue } from "./type";
// ref 接受一个内部值  返回一个响应式的、可更改的的ref对象

export function ref(target: TRefValue) {
  return createRef(target);
}

export function shallowRef(target: TRefValue) {
  return createRef(target, true);
}

export function createRef(target: TRefValue, shallow = false) {
  return new Ref(target, shallow);
}

class Ref {
  public _isRef: boolean = true;
  public _value: any;
  constructor(public rawValue: any, public shallow: boolean) {
    this._value = rawValue;
  }

  // 属性访问器
  get value() {
    track(this, "value");
    return this._value;
  }

  set value(value: any) {
    if (!isEqualValue(this._value, value)) {
      this._value = value;
      this.rawValue = value;
      trigger(this, "value", TriggerType.SET, value);
    }
  }
}

// toRef 将对象的摸一个属性值转化为ref 对象
export function toRef(target: object, key: any) {
  return new ObjectRef(target, key);
}

class ObjectRef {
  public _isRef = true;
  constructor(public target: any, public key: string) {}

  get value() {
    track(this.target, this.key);
    return this.target[this.key];
  }

  set value(value: any) {
    this.target[this.key] = value;
    trigger(this.target, this.key, TriggerType.SET, value);
  }
}

export function toRefs(target: object) {
  const ret: any = isArray(target) ? new Array((target as []).length) : {};
  for (let key in target) {
    ret[key] = toRef(target, key);
  }
  return ret;
}
