// 针对浏览器平台Dom节点的操作 增删改查

export const nodeOps = {
  // 创建dom节点
  createElement: (tagName: string): Element => {
    return document.createElement(tagName);
  },
  // 移除节点
  remove: (child: Element) => {
    const parent = child.parentNode;
    parent && parent.removeChild(child);
  },
  // 插入节点  anchor 插入锚点 不传直接追加
  insert: (child: Element, parent: Element, anchor = null) => {
    parent && parent.insertBefore(child, anchor);
  },
  // 查找节点
  querySelector: (selector: string) => {
    return document.querySelector(selector);
  },
  // 设置文本
  setElementText: (ele: Element, text: string) => {
    ele.textContent = text;
  },
  // 创建文本节点
  createContentText: (text: any) => {
    return document.createTextNode(text);
  },
  // 设置文本节点值
  setText: (node: { nodeValue: any }, text: any) => {
    node.nodeValue = text;
  },
};
