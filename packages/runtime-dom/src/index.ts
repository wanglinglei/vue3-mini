// runtime 浏览器运行时 操作dom   1.节点  2.属性

import { nodeOps } from "./nodeOps";
import { patchProps } from "./patchProps";

const renderOptionDOM = { ...nodeOps, patchProps };

export { renderOptionDOM };
