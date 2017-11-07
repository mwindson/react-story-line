import * as d3 from 'd3'
import * as moment from 'moment'
import '../../style/Calender.styl'
class CalenderGrid {
  month: number
  year: number
  svg: d3.Selection<SVGSVGElement, {}, null, undefined>
  constructor(svg: SVGSVGElement, year: number) {
    this.svg = d3.select(svg)
    this.year = year
  }
  draw() {
    const svg = this.svg
    for (let i = 0; i < 12; i += 1) {
      this.drawMonth(i + 1)
      const month = this.svg.select(`.month${i + 1}`)
      month
        .attr('transform', `translate(${(i % 4) * 225},${Math.floor(i / 4) * 260 + 10}) scale(0.1)`)
        .attr('transform-origin', '50% 50%')
        .transition()
        .duration(1500)
        .attr('transform', `translate(${(i % 4) * 225},${Math.floor(i / 4) * 260 + 10}) scale(1)`)
      month
        .on('mouseover', function () {
          d3.select(this).select('rect').attr('fill', 'rgba(200,200,200,0.5)')
          d3.select(this).attr('transform', `translate(${(i % 4) * 225},${Math.floor(i / 4) * 260}) scale(1)`)
        })
        .on('mouseout', function () {
          d3.select(this).select('rect').attr('fill', 'rgba(255,255,255,.1)')
          d3.select(this).attr('transform', `translate(${(i % 4) * 225},${Math.floor(i / 4) * 260 + 10}) scale(1)`)
        })
    }
  }
  drawMonth(month = this.month) {
    const width = 30
    const height = 30
    const day = moment(`${this.year}-${month}-01`)
    const g = this.svg.append('g').attr('class', 'month' + month).attr('id', 'month')
    g.append('text').text(day.format('MMMM')).attr('text-anchor', 'middle')
      .attr('x', width * 3.5).attr('y', height / 2 + 4)
    const monthCard = g.append('g').attr('class', 'month-card')
    // add week label
    const weekLabel = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    for (let i = 0; i < 7; i += 1) {
      monthCard.append('text').attr('text-anchor', 'middle')
        .attr('x', i * width + width / 2).attr('y', height * 1.5 + 4)
        .text(weekLabel[i]).attr('fill', 'red')
    }
    // add date of month
    const offset = day.day()
    while (day.isBefore(moment(`${this.year}-${month}-01`).add(1, 'M'))) {
      const weekday = day.day()
      monthCard.append('text').attr('text-anchor', 'middle')
        .attr('x', weekday * width + width / 2)
        .attr('y', height * 1.5 + 4 + height * Math.ceil((day.date() + offset) / 7))
        .text(day.date())
      day.add(1, 'd')
    }
    g.append('rect')
      .attr('x', 0).attr('y', 0)
      .attr('width', 225).attr('height', 250)
      .attr('fill', 'rgba(255,255,255,0.1)').attr('cursor', 'pointer')
  }
  exit() {
    for (let i = 0; i < 12; i += 1) {
      this.svg.select(`.month${i + 1}`)
        .transition()
        .duration(1500)
        .attr('transform', `translate(${(i % 4) * 225},${Math.floor(i / 4) * 300}) scale(0.1)`)
        .on('end', function () {
          d3.select(this).remove()
        })
    }
  }
}

export default CalenderGrid