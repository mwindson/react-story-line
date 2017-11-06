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
    const { layout, width, height, year } = this.props
    this.calender = new CalenderSpiral(this.svg, 900, 900, year)
    this.calender.draw()
    // this.calender.exit()
  }

  render() {
    const { width, height } = this.props
    return (
      <svg width={width} height={height} ref={(node) => this.svg = node} viewBox={'0,0 900,900'} />
    )
  }
}

export default Calender