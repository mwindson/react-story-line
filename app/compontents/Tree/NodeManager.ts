interface Node {
  id: number
  name: string
  type: string
  collapse: boolean
  children: Node[]
}
interface NodeData {
  name: string
  type: string
  children: Node[]
}
class NodeManager {
  tree: Node
  constructor(data: NodeData) {
    this.tree = this.buildTree(data)
  }
  public buildTree(data: NodeData, index = 0) {
    return {
      ...data,
      id: index,
      collapse: false,
      children: data.children.map((child, i) => this.buildTree(child, index + 1 + i))
    }
  }
  public remove(index: number) {
    
  }

  public getData() {}
}
