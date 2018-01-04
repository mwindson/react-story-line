import * as RX from 'rxjs'
import * as d3 from 'd3'
import { Observable } from 'rxjs/Observable'
import { HierarchyNode } from 'd3'

interface NodeData {
  name: string
  children: NodeData[] | null
  _children: NodeData[] | null
  x: number
  y: number
}
let newData = {
  name: '属性',
  type: 'root'
}
export default function TreeDrawing(dataStream: RX.Observable<any>, svg: SVGSVGElement): Observable<any> {
  const duration = 500
  return RX.Observable.create((observer: any) => {
    dataStream.map(d => initData(d)).subscribe(data => {
      const g = d3
        .select(svg)
        .selectAll('.tree-group')
        .data([data])
        .enter()
        .append('g')
        .attr('class', 'tree-group')
        .attr('transform', 'translate(40,40)')
      const tree = d3.tree().size([800, 600])
      const link = g.selectAll('.link').data(tree(data).links())
      link
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', d => d3.linkHorizontal()({ source: [d.source.x, d.source.y], target: [d.target.x, d.target.y] }))
        .attr('stroke', 'gray')
        .attr('fill', 'none')
      link
        .exit()
        .attr('d', function(d: d3.HierarchyPointLink<{}>) {
          const o: [number, number] = [d.source.x, d.source.y]
          return d3.linkHorizontal()({ source: o, target: o })
        })
        .remove()
      const node = g.selectAll('.node').data(data.descendants())
      console.log(data.descendants())
      const nodeEnter = node
        .enter()
        .append('g')
        .attr('class', (d: NodeData) => 'node')
        .attr('transform', (d: NodeData) => `translate(${d.x},${d.y})`)
      console.log(node.exit().size())
      node
        .exit()
        // .attr('transform', (d: NodeData) => `translate(${d.x},${d.y})`)
        .remove()
      nodeEnter
        .append('circle')
        .attr('r', 5)
        .attr('stroke', 'blue')
        .attr('fill', d => (d._children !== null && d.children === null ? 'lightsteelblue' : '#fff'))

      nodeEnter
        .append('text')
        .attr('dy', 3)
        .attr('x', function(d) {
          return d.children ? -8 : 8
        })
        .style('text-anchor', function(d) {
          return d.children ? 'end' : 'start'
        })
        .text(function(d) {
          return d.data.name
        })
      nodeEnter
        .on('mouseover', function() {
          d3.select(this).attr('cursor', 'pointer')
        })
        .on('mouseout', function() {
          d3.select(this).attr('cursor', 'auto')
        })
        .on('click', function(d: HierarchyNode<any>) {
          click(d)
          observer.next(data)
        })

      node.each(function(d: HierarchyNode<any>) {
        d.x0 = d.x
        d.y0 = d.y
      })
    })
  })
}

function initData(root: HierarchyNode<any>): any {
  function collapse(d: HierarchyNode<any>) {
    if (d.children !== undefined) {
      if (d._children === undefined) d._children = null
    }
  }
  root.each(node => collapse(node))
  return root
}
function click(d: HierarchyNode<any>) {
  if (d.children) {
    d._children = d.children
    d.children = null
  } else {
    d.children = d._children
    d._children = null
  }
}
