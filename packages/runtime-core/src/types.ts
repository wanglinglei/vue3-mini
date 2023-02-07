//
export interface IRenderOptionDOM {
  // 创建dom节点
  createElement: (tag: string) => Element;
  // 移除节点
  remove: (child: Element) => void;
  // 插入节点  anchor 插入锚点 不传直接追加
  insert: (child: Element, parent: Element, anchor?: Element | null) => void;
  // 查找节点
  querySelector: (selector: string) => Element | null;
  // 设置文本
  setElementText: (ele: Element, text: string) => void;
  // 创建文本节点
  createContentText: (text: any) => Text;
  // 设置文本节点值
  setText: (node: { nodeValue: any }, text: any) => void;
}
