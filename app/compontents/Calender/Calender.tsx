import React, { PureComponent } from 'react'
import CalenderSpiral from './CalenderSpiral'
interface CalenderProps {
  width: number, height: number, layout: string, year: number,
  startAngle: number,
}

class Calender extends PureComponent<CalenderProps, {}> {
  svg: SVGSVGElement
  calender: CalenderSpiral

  constructor(props: CalenderProps) {
    super(props)
    this.svg = null
    this.calender = null
  }

  componentDidMount() {
    const { layout, width, height } = this.props
    this.calender = new CalenderSpiral(this.svg, width, height)
    this.calender.draw()
  }

  render() {
    const { width, height } = this.props
    return (
      <div className="svg-part">
        <svg width={width} height={height} ref={(node) => this.svg = node} />
      </div>
    )
  }
}

export default Calender