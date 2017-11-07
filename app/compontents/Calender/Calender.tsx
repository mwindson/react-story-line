import * as d3 from 'd3'
import React, { PureComponent } from 'react'
import CalenderGrid from './CalenderGrid'
import CalenderSpiral from './CalenderSpiral'
interface CalenderProps {
  width: number, height: number, layout: string, year: number,
}
interface CalenderState {
  month: number,
}

class Calender extends PureComponent<CalenderProps, CalenderState> {
  svg: SVGSVGElement
  calender: CalenderSpiral | CalenderGrid

  constructor(props: CalenderProps) {
    super(props)
    this.state = {
      month: 0, // 0 means all months
    }
    this.svg = null
    this.calender = null
  }

  componentDidMount() {
    const { layout, width, height, year } = this.props
    this.calender =
      layout === 'spiral' ?
        new CalenderSpiral(this.svg, year, this.chooseMonth) :
        new CalenderGrid(this.svg, year)
    this.calender.draw()
  }

  componentWillReceiveProps(nextProps: CalenderProps) {
    if (nextProps.layout !== this.props.layout) {
      this.calender.exit()
      this.calender = nextProps.layout === 'spiral' ?
        new CalenderSpiral(this.svg, nextProps.year, this.chooseMonth)
        : new CalenderGrid(this.svg, nextProps.year)
      this.calender.draw()
    }
  }
  chooseMonth = (month: number) => {
    this.setState({ month })
  }
  render() {
    const { width, height } = this.props
    return (
      <svg width={width} height={height} ref={(node) => this.svg = node} viewBox={`0,0 ${width},${height}`} />
    )
  }
}

export default Calender