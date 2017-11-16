import * as d3 from 'd3'
import * as _ from 'lodash'

interface TimeSeq { time: string, content: string }
interface Year { time: string, events: String[], count: number, year: number }
interface Slider { x: number }

class YearLine {
  height: number;
  width: number;
  data: Year[]
  svg: d3.Selection<SVGElement, {}, HTMLElement, null>
  constructor(svg: SVGSVGElement, data: Year[]) {
    this.svg = d3.select(svg)
    this.data = data
    this.width = 1150
    this.height = 900
  }
  draw() {
    const yearLine = this.svg.append('g').attr('class', 'year-line')
    // draw year area
    const countRange = [0, d3.max(_.map(this.data, 'count'))]
    const extendData = (data) => {
      let d = [...data]
      const len = d.length
      for (let i = 0; i < len - 1; i += 1) {
        if (d[i + 1].year - d[i].year > 1) {
          for (let t = d[i].year + 1; t < d[i + 1].year - 1; t += 1) {
            d.push({ time: '', events: [], count: 0, year: t })
          }
        }
      }
      d = _.sortBy(d, 'year')
      return d
    }
    const years = _.map(this.data, 'year')
    const x = d3.scaleLinear().domain(years).range(d3.range(20, this.width, this.width / (years.length - 1)))
    const y = d3.scaleLinear().domain(countRange).range([this.height / 2, 200])
    const color = d3.scaleLinear().domain([0, this.data.length - 1]).range(['#7f0083', '#ffa700'])
      .interpolate(d3.interpolateHclLong)
    const areaFunc = d3.area().x((d: Year) => x(d.year))
      .y0((d: Year) => y(d.count)).y1(y(0))
      .curve(d3.curveBasis)
    yearLine.append('path').attr('class', 'area').datum(_.sortBy(this.data, 'year'))
      .attr('d', (d) => areaFunc(extendData(d)))
      .attr('fill', 'skyblue').attr('stroke', 'skyblue')
    // add axis
    const tickValues = _.range(0, 20).map((v, i) => x.invert(this.width / 20 * i))
    const axis = d3.axisBottom(x).tickValues(tickValues)
    // .tickFormat(d => `${d}年`)
    yearLine.append('g').attr('transform', `translate(20,${this.height / 2})`).call(axis)
    // add tooltip
    const bisect = d3.bisector(function (d: Year) { return d.year }).left
    const focus = yearLine.append("g").attr("class", "focus").style('display', 'none')
    focus.append('line')
      .attr('class', 'hover-line')
      .attr('x1', 0).attr('y1', 0).attr('y2', this.height / 2).attr('x2', 0)
      .attr('stroke', 'red')
    focus.append('foreignObject').attr('class', 'events').attr('width', 200).attr('height', 300)
    this.svg.append("rect")
      .attr("opacity", "0")
      .attr("width", this.width + 20)
      .attr("height", this.height / 2)
      .on("mouseover", function () { focus.style("display", null); })
      .on("mouseout", function () { focus.style("display", "none"); })
      .on("mousemove", mousemove)
    const data = this.data
    function mousemove() {
      const x0 = x.invert(d3.mouse(this)[0])
      const i = bisect(data, x0)
      let d: Year
      if (i === 0) {
        d = data[i]
      } else if (i === data.length) {
        d = data[i - 1]
      } else {
        const d0 = data[i - 1]
        const d1 = data[i]
        d = x0 - d0.year > d1.year - x0 ? d1 : d0
      }
      focus.select('.events')
        .attr('transform', `translate(${x(d.year) < 900 ? 20 : -220},20)`)
        .html(`<div style="padding:5px;color:white;background:gray;">${d.time}<br>${d.events.join('<br>')}</div>`)
      focus.attr("transform", `translate(${x(d.year)},0)`);
    }
  }

}

export default YearLine