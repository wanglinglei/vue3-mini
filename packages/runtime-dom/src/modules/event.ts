import { isArray } from "@vue/shared";

type EventValue = Function | Function[];

interface Invoker extends EventListener {
  value: EventValue;
  attached?: number;
}

/**
 * @description: 处理事件
 * @param {Element} ele
 * @param {string} key
 * @param {EventValue} eventValue
 * @return {*}
 */
export function patchEvent(
  ele: Element & { _invokers?: Record<string, any> },
  key: string,
  eventValue: EventValue
) {
  const invokers = ele._invokers || (ele._invokers = {});
  const existInvoker = invokers[key];
  if (existInvoker && eventValue) {
    // 更新
    existInvoker.value = eventValue;
  } else {
    // 新增事件 获取事件名称 绑定
    const eventName = key.slice(2, key.length).toLocaleLowerCase();
    if (eventValue) {
      // 有新的事件
      let invoker: Invoker = createInvoker(eventValue);
      addEventListener(ele, eventName, invoker);
    } else {
      // 没有新的事件 删除对应的事件
      removeEventListener(ele, eventName, existInvoker);
      invokers[key] = undefined;
    }
  }
}

function createInvoker(eventValue: EventValue): Invoker {
  const fn: Invoker = (e: Event) => {
    if (isArray(eventValue)) {
      //@ts-ignore
      fn.value.forEach((val) => {
        val(e);
      });
    } else {
      //@ts-ignore
      fn.value(e);
    }
  };
  fn.value = eventValue;
  return fn;
}

export function addEventListener(
  el: Element,
  event: string,
  handler: EventListener,
  options?: EventListenerOptions
) {
  el.addEventListener(event, handler, options);
}

export function removeEventListener(
  el: Element,
  event: string,
  handler: EventListener,
  options?: EventListenerOptions
) {
  el.removeEventListener(event, handler, options);
}
