// runtime 浏览器运行时 操作dom   1.节点  2.属性
import { createRender, h } from "@vue/runtime-core";
import { nodeOps } from "./nodeOps";
import { patchProps } from "./patchProps";

const renderOptionDOM = { ...nodeOps, patchProps };
export { h };
export { renderOptionDOM };

export function createApp(rootComponent: any, rootPros: {}) {
  //  跨平台 传入不同的\平台的渲染方法
  let app = createRender(renderOptionDOM).createApp(rootComponent, rootPros);
  let { mount } = app;
  // @ts-ignore
  app.mount = (dom: string) => {
    // 挂载组件  先清空内容 再将组件挂载到容器
    let container = nodeOps.querySelector(dom);
    container && (container.innerHTML = "");
    console.log("container", container);

    mount(container as HTMLElement);
  };
  return app;
}
