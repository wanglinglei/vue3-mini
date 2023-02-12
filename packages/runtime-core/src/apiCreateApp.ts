import { createVnode } from "./vnode";

type TRender = (vnode: Record<string, any>, containder: Element) => void;
/**
 * @description: 创建app实例 添加相关属性方法
 * @param {TRender} render
 * @return {*}
 */
export function createAppApi(render: TRender) {
  return function createApp(rootComponent: any, rootProps: {}) {
    let app = {
      _component: rootComponent,
      _props: rootProps,
      _container: null,
      mount(container: Element) {
        // 创建虚拟dom
        let vnode = createVnode(rootComponent, rootProps);
        // render the vnode
        render(vnode, container);
        //@ts-ignore
        app._container = container;
      },
    };
    return app;
  };
}
