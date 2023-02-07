import { IRenderOptionDOM } from "./types";

import { createAppApi } from "./apiCreateApp";
/**
 * @description: 创建渲染方法
 * @param {IRenderOptionDOM} renderOptionDOM
 * @return {*}
 */
export function createRender(renderOptionDOM: IRenderOptionDOM) {
  let render = (vnode: {}, container: Element) => {
    console.log("createRender-render", vnode);
  };
  return {
    createApp: createAppApi(render),
  };
}
