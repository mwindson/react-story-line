import * as React from 'react'
import * as RX from 'rxjs'
import * as d3 from 'd3'
import TreeDrawing from './TreeDrawing'
import { Observable } from 'rxjs/Observable'
export interface TreeProps {}

export interface TreeState {}

let data = {
  name: '属性',
  type: 'root',
  children: [
    {
      name: '全局属性',
      type: 'attr',
      children: [
        {
          name: '发动机类型',
          type: 'fieldId',
          children: [
            {
              name: '柴油型',
              type: 'standardValue',
              children: [{ name: '柴油型', type: 'value' }, { name: '柴油', type: 'value' }]
            },
            {
              name: '汽油型',
              type: 'standardValue',
              children: [
                { name: '柴油/电', type: 'value' },
                { name: '油电混合柴油', type: 'value' },
                { name: '油电混合型', type: 'value' }
              ]
            },
            {
              name: '柴油混合型',
              type: 'standardValue',
              children: [
                { name: '汽油型', type: 'value' },
                { name: '汽油', type: 'value' },
                { name: '汽型油', type: 'value' }
              ]
            }
          ]
        },
        {
          name: '品牌名称',
          type: 'fieldId',
          children: [
            {
              name: '路虎',
              type: 'standardValue',
              children: [{ name: '路虎', type: 'value' }]
            }
          ]
        },
        {
          name: '排量',
          type: 'fieldId',
          children: [
            {
              name: '3900cc',
              type: 'standardValue',
              children: [{ name: '3900CC', type: 'value' }]
            }
          ]
        }
      ]
    },
    {
      name: '局部属性',
      type: 'attr',
      children: [
        {
          name: '型号',
          type: 'feildId'
        }
      ]
    }
  ]
}
export default class Tree extends React.Component<TreeProps, TreeState> {
  svg: SVGSVGElement
  drawing: Observable<any>
  constructor(props: TreeProps) {
    super(props)
    this.state = {}
    this.drawing = null
    this.svg = null
  }
  componentDidMount() {
    const replay = new RX.Subject()
    const dataStream = RX.Observable.of(d3.hierarchy(data)).concat(replay)
    this.drawing = TreeDrawing(dataStream, this.svg)
    this.drawing.subscribe(x => {
      replay.next(x)
    })
  }

  render() {
    return (
      <div className="svg-part">
        <svg width="1200" height="800" ref={node => (this.svg = node)} />
      </div>
    )
  }
}
