import * as React from 'react';
import '../../style/Clock.styl'
import DrawManager from './DrawManager'

export interface TimeSeq { time: string, content: string }
interface ClockProps { timeSeq: TimeSeq[], layout: string, timeIndex: number }
class Clock extends React.Component<ClockProps, {}> {
  drawManager: DrawManager
  svg: SVGSVGElement

  constructor(props: ClockProps) {
    super(props)
    this.drawManager = null
    this.svg = null
  }
  componentDidMount() {
    const { timeSeq, layout, timeIndex } = this.props
    this.drawManager = new DrawManager(this.svg, timeSeq, timeIndex, layout)
    this.drawManager.draw()
  }
  componentWillReceiveProps(nextProps: ClockProps) {
    const { timeSeq, layout, timeIndex } = this.props
    if (nextProps.timeSeq !== timeSeq) {
      this.drawManager = new DrawManager(this.svg, nextProps.timeSeq, nextProps.timeIndex, nextProps.layout)
      this.drawManager.draw()
    } else if (nextProps.layout !== layout) {
      this.drawManager.changeLayout(nextProps.layout)
    } else if (nextProps.timeIndex !== timeIndex) {
      if (nextProps.layout === 'multi') {
        this.drawManager.append(nextProps.timeIndex)
      } else {
        this.drawManager.update(nextProps.timeIndex)
      }
    }
  }
  render() {
    return (
      <div className="svg-part">
        <svg width="1200" height="1500" ref={(node) => this.svg = node} />
      </div>
    )
  }
}

export default Clock;