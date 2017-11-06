import * as d3 from 'd3'
import * as moment from 'moment'

class CalenderGrid {
  year: number;
  svg: d3.Selection<SVGSVGElement, {}, null, undefined>;
  constructor(svg: SVGSVGElement, year: number, month: number) {
    this.svg = d3.select(svg)
    this.year = year

  }
}

export default CalenderGrid