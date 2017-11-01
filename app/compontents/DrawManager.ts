import * as d3 from 'd3'
import * as moment from 'moment'

interface Tick { value: number, type: string }
export interface TimeSeq { time: string, content: string }
interface PointerColor { second: string, minute: string, hour: string }
export default class DrawManager {
  svg: d3.Selection<SVGElement, {}, HTMLElement, null>
  timeSeq: TimeSeq[]
  timer: d3.Timer
  timeIndex: number
  lineData: Array<[number, number]>
  layout: string
  radius: number
  constructor(svgElement: SVGSVGElement, timeSeq: TimeSeq[], timeIndex: number, layout: string) {
    this.svg = d3.select(svgElement)
    // this.time = moment(time.time)
    // this.content = time.content
    this.timeSeq = timeSeq
    this.timer = null
    this.timeIndex = timeIndex
    this.layout = layout
    this.lineData = [] // 时间线数据
    this.radius = 100
    // 更换地方
  }
  public draw() {
    this.svg.append('g').attr('class', 'time-line').append('path')
    this.drawClock(this.timeIndex, this.layout)
  }
  public drawClock(index: number, layout: string) {
    const outerRadius = this.radius
    const innnerRadius = outerRadius * 0.95
    const position = (i: number): [number, number] => [i % 2 === 0 ? 200 : 1000, i * 120 + 100]
    const clock = this.svg
      .append('g')
      .attr('class', 'clock')
      .attr('transform',
      layout === 'multi' ? `translate(${position(index)[0] + (index % 2 === 0 ? - 100 : 100)},${position(index)[1]})` :
        `translate(${position(0)[0] - 100},${position(0)[1]})`)
      .attr('opacity', 0)
    this.lineData.push(position(index))
    // outer clock
    clock
      .append('circle')
      .attr('fill', 'white')
      .attr('r', outerRadius)
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
    clock
      .append('circle')
      .attr('fill', 'white')
      .attr('class', 'center')
      .attr('r', 5)
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
    // ticks
    const hourScale = d3.scaleLinear()
      .range([0, 330])
      .domain([0, 11]);

    const secondScale = d3.scaleLinear()
      .range([0, 354])
      .domain([0, 59]);
    const minuteScale = secondScale

    const hourTickStart = outerRadius
    const hourTickLength = -18
    clock.selectAll('.minute-tick')
      .data(d3.range(0, 60)).enter()
      .append('line')
      .attr('class', 'minute-tick')
      .attr("stroke", 'black')
      .attr("stroke-width", 1.5)
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', hourTickStart)
      .attr('y2', hourTickStart + hourTickLength + 8)
      .attr('transform', (d) => `rotate(${minuteScale(d)}) `)
    const hourLabelRadius = outerRadius - 30
    const hourLabelYOffset = 5
    const radians = 0.0174532925
    clock.selectAll('.hour-tick')
      .data(d3.range(0, 12)).enter()
      .append('line')
      .attr('class', 'hour-tick')
      .attr("stroke", 'red')
      .attr("stroke-width", 1.5)
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', hourTickStart)
      .attr('y2', hourTickStart + hourTickLength)
      .attr('transform', (d) => `rotate(${hourScale(d)}) `)
    clock.selectAll('.seconde-label')
      .data(d3.range(1, 13))
      .enter()
      .append('text')
      .attr('class', 'second-label')
      .attr('text-anchor', 'middle')
      .attr('x', (d) => hourLabelRadius * Math.sin(hourScale(d) * radians))
      .attr('y', (d) => -hourLabelRadius * Math.cos(hourScale(d) * radians) + hourLabelYOffset)
      .text((d) => d)

    // ticks
    this.drawPointers(innnerRadius * 0.8, clock, moment(this.timeSeq[index].time), index)
    this.drawStoryLine(clock, index, layout)
  }

  // 更新传入的时间并进行重画，以动画过渡
  public update(index: number) {
    const prevTime = moment(this.timeSeq[this.timeIndex].time)
    const NextTime = moment(this.timeSeq[index].time)
    const id = d3.interpolateDate(prevTime.toDate(), NextTime.toDate())
    let timer = this.timer
    timer = d3.timer(function tweenTime(t) {
      const duration = 1000
      const p = Math.min(t / duration, 1)
      const tt = id(p)
      const second = moment(tt).second()
      const minute = moment(tt).minute()
      const hour = (moment(tt).hour() % 12) + (minute / 60)
      const data: Tick[] = [
        // { value: second, type: 'second' },
        { value: minute, type: 'minute' },
        { value: hour, type: 'hour' },
      ]
      d3.select('.clock-hands')
        .selectAll('line')
        .data(data)
        .attr('transform', (d) => d.type === 'hour' ? `rotate(${d.value * 30}) ` : `rotate(${d.value * 6}) `)

      if (t > duration) {
        timer.stop()
      }
    })
    this.svg.select('.clock')
      .selectAll('.activity')
      .data([this.timeSeq[index]])
      .transition()
      .text((d) => `${d.time} ${d.content} `)
    this.timeIndex = index
  }

  // 根据新增的时间时间绘制图
  public append(index: number) {
    this.timeIndex = index
    this.drawClock(index, 'multi')
  }

  // 改变story line的展示方式
  public changeLayout(layout: string) {
    this.svg.selectAll('g').remove()
    if (layout === 'single') {
      this.drawClock(this.timeIndex, 'single')
    } else {
      this.svg.append('g').attr('class', 'time-line').append('path')
      for (let i = 0; i <= this.timeIndex; i++) {
        setTimeout(() => this.drawClock(i, 'multi'), 2000 * i)
      }
    }
  }

  private drawPointers(
    radius: number,
    clock: d3.Selection<Element | d3.EnterElement | Document | Window, {}, HTMLElement, null>, time: moment.Moment,
    index: number) {
    const second = time.second()
    const minute = time.minute()
    const hour = (time.hour() % 12) + (minute / 60)
    const data: Tick[] = [
      // { value: second, type: 'second' },
      { value: minute, type: 'minute' },
      { value: hour, type: 'hour' },
    ]
    const tickColor: PointerColor = { second: 'black', minute: 'blue', hour: 'red' }
    const clockHands = clock
      .append('g')
      .attr('class', 'clock-hands')
      .selectAll('line')
      .data(data)
      .enter()
      .append('line')
      .attr("stroke", (d: Tick) => tickColor[d.type])
      .attr("stroke-width", 1.5)
      .attr('x1', 0)
      .attr('y1', -5)
      .attr('x2', 0)
      .attr('y2', (d) => d.type === 'second' ? -radius : (d.type === 'minute' ? -radius * 0.8 : -radius * 0.6))
      .attr('transform', (d) => d.type === 'hour' ? `rotate(${d.value * 30}) ` : `rotate(${d.value * 6}) `)
    clock
      .selectAll('.activity')
      .data([this.timeSeq[index]])
      .enter()
      .append('text')
      .attr('class', 'activity')
      .attr('text-anchor', 'middle')
      .attr('x', 0)
      .attr('y', this.radius + 30)
      .text((d) => `${d.time} ${d.content} `)
  }

  private drawStoryLine(
    clock: d3.Selection<Element | d3.EnterElement | Document | Window, {}, HTMLElement, null>,
    index: number,
    layout: string,
  ) {
    // story-line-path
    const timeLine = (i: number) => `M ${(i - 1) % 2 === 0 ? 200 : 1000} ${(i - 1) * 120 + 100}
C${(i - 1) % 2 === 0 ? 200 : 1000} ${(i - 1) * 120 + 150},
${i % 2 === 0 ? 200 : 1000} ${i * 120 + 50},
${i % 2 === 0 ? 200 : 1000} ${i * 120 + 100} `
    if (index >= 1 && layout === 'multi') {
      const path = this.svg
        .select('.time-line')
        .append('path')
        .attr('d', timeLine(index))
        .attr('fill', 'none')
        .attr('stroke', 'blue')
      const totalLength = (path.node() as SVGPathElement).getTotalLength()
      path.attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(2000)
        .attr("stroke-dashoffset", 0)
      clock.transition().delay(2000).duration(1000).attr('opacity', 1)
    } else {
      clock.transition().duration(1000).attr('opacity', 1)
    }
  }
}