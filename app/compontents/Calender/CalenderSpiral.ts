import * as d3 from 'd3'
import * as moment from 'moment'

interface Point { x: number, y: number }
class CalenderSpiral {
  f: number
  v: number
  svg: d3.Selection<SVGElement, {}, HTMLElement, null>
  radius: number
  center: Point
  year: number
  totalAngle: number
  constructor(svg: SVGSVGElement, width: number, height: number, year: number) {
    this.svg = d3.select(svg)
    this.radius = Math.min(width, height) / 2
    this.center = { x: width / 2, y: height / 2 }
    this.year = year
    this.totalAngle = 0
    this.v = 0.06
    this.f = this.radius / (21 * this.v)
  }

  public draw() {
    const calender = this.svg.append('g').attr('class', 'calender')
    this.svg.append('text').text(this.year).attr('text-anchor', 'middle').attr('font-size', 40)
      .attr('x', this.center.x).attr('y', this.center.y + 20)
    this.drawSpiral(calender, 0, this.center, this.radius, this.year)
    this.addRotate(calender, this.center, this.radius, this.year)
    this.dateInteract(calender)
  }

  public exit() {
    const calEndRadius = (startAngle: number, startRadius: number, endAngle: number) =>
      startRadius - (startAngle - endAngle) * (this.radius / 21) / (Math.PI)
    // todo 日期沿螺旋线路径进行收缩或展开的动画
    const spiral = this.svg.select('.calender').select('.shape').select('path')
    this.svg.select('.calender').select('.shape').selectAll('line').remove()
    const dates = this.svg.select('.calender').select('.dates').selectAll('g')
    const ang = this.totalAngle
    const self = this
    const tweenDash = function () {
      const l = (spiral.node() as SVGPathElement).getTotalLength();
      const i = d3.interpolateString(l + "," + l, "0," + l); // interpolation of stroke-dasharray style attr
      const marker = d3.select("#i0")
      const data = marker.datum() as Date
      return function (t) {
        dates.each(function (d: Date, index) {
          if (t >= 1 / 377 * index) {
            const a = d3.interpolateNumber(0, d.startAngle - 4 * Math.PI)
            const ndata = { ...d }
            ndata.startAngle -= a(t)
            ndata.startRadius = calEndRadius(data.startAngle, data.startRadius, ndata.startAngle)
            ndata.endAngle -= a(t)
            ndata.endRadius = calEndRadius(data.endAngle, data.endRadius, ndata.endAngle)
            d3.select(this).select('text').remove()
            d3.select(this)
              .select('path').attr("d", self.generatePath(ndata, self.center, self.f, self.v)) // move marker
          }
        })
        return i(t);
      }
    }
    spiral.transition()
      .duration(7500)
      .attrTween("stroke-dasharray", tweenDash)
      .on('end', function () {
        dates.remove()
      })
  }

  /**
   * 绘制螺旋线
   *  X=(a+bs)cos(s), Y=(a+bs)sin(s)
   */
  private drawSpiral(
    calender: d3.Selection<Element | d3.EnterElement | Document | Window, {}, HTMLElement, null>,
    startAnlge: number, center: Point, radius: number, year: number) {
    let a = 0 // 角度
    let b = 0//  半径
    const v = 0.06 // 直线移动速度
    const f = radius / (21 * v) // 转动速度

    const spiral = d3.line()
    // .curve(d3.curveBasis)
    const spiralData: Array<[number, number]> = []
    while (a <= 21 * Math.PI + startAnlge) {
      const p1: [number, number] = [center.x + b * Math.sin(a), center.y + b * Math.cos(a)]
      if (a >= Math.PI * 2 + startAnlge) { spiralData.push(p1) }
      a = a + Math.PI / f
      b = b + v
    }
    const shape = calender.append('g').attr('class', 'shape')
    shape.append('path').attr('d', spiral(spiralData)).attr('stroke', 'red').attr('fill', 'none')
    this.totalAngle = a
    const dates: Date[] = generateYearData(year, b, a, v, f)
    shape.selectAll('line').data(dates).enter()
      .append('line')
      .attr('x1', (d) => center.x + d.startRadius * Math.sin(d.startAngle))
      .attr('y1', (d) => center.y + d.startRadius * Math.cos(d.startAngle))
      .attr('x2', (d) => center.x + (d.startRadius - 2 * f * v) * Math.sin(d.startAngle - 2 * Math.PI))
      .attr('y2', (d) => center.y + (d.startRadius - 2 * f * v) * Math.cos(d.startAngle - 2 * Math.PI))
      .attr('stroke', 'black')
    shape
      .append('line')
      .datum(dates[dates.length - 1])
      .attr('x1', (d) => center.x + d.endRadius * Math.sin(d.endAngle))
      .attr('y1', (d) => center.y + d.endRadius * Math.cos(d.endAngle))
      .attr('x2', (d) => center.x + (d.endRadius - 2 * f * v) * Math.sin(d.endAngle - 2 * Math.PI))
      .attr('y2', (d) => center.y + (d.endRadius - 2 * f * v) * Math.cos(d.endAngle - 2 * Math.PI))
      .attr('stroke', 'black')
    // every date picker

    const datesPart = calender.append('g').attr('class', 'dates')
    const datePart = datesPart.selectAll('g').data(dates).enter().append('g').attr('class', 'date')
      .attr('id', (d) => 'i' + d.index)
    datePart.append('path').attr('d', (d: Date) => this.generatePath(d, center, f, v))
      .attr('fill', (d) => d.color)
    // add date text
    datePart.append('text').text((d) => d.text)
      .attr('x', (d) => center.x + (d.startRadius - f * v) * Math.sin((d.startAngle + d.endAngle) / 2) - 12)
      .attr('y', (d) => center.y + 5 + (d.startRadius - f * v) * Math.cos((d.startAngle + d.endAngle) / 2))
      .attr('fill', (d) => d.type === 'monthLabel' ? 'white' : 'black')
      .attr('font-size', 16)
    // outer border
  }
  private addRotate(
    calender: d3.Selection<Element | d3.EnterElement | Document | Window, {}, HTMLElement, null>,
    center: Point,
    radius: number,
    year: number) {
    let prevMouseX: number = 0
    let prevMouseY: number = 1
    let rotateAnlge: number = 0
    calender.call(d3.drag()
      .on("start", function () {
        prevMouseX = d3.event.x
        prevMouseY = d3.event.y
      })
      .on("drag", function () {
        const fn = (l1: number, l2: number): number => Math.sqrt(Math.pow(l1, 2) + Math.pow(l2, 2))
        const startAngle = Math.atan2(prevMouseY - center.y, prevMouseX - center.x)
        const endAngle = Math.atan2(d3.event.y - center.y, d3.event.x - center.x)
        // console.log(startAngle, endAngle)
        const a = fn(prevMouseX - center.x, prevMouseY - center.y)
        const b = fn(d3.event.x - center.x, d3.event.y - center.y)
        const c = fn(prevMouseX - d3.event.x, prevMouseY - d3.event.y)
        const deltaAngle = Math.acos((Math.pow(a, 2) + Math.pow(b, 2) - Math.pow(c, 2)) / (2 * a * b))
        rotateAnlge += (startAngle < endAngle ? 1 : -1) * deltaAngle / Math.PI * 180
        d3.select(this).attr('transform', `rotate(${rotateAnlge})`).attr('transform-origin', `${center.x} ${center.y}`)
        prevMouseX = d3.event.x
        prevMouseY = d3.event.y
      }))
  }
  private dateInteract(
    calender: d3.Selection<Element | d3.EnterElement | Document | Window, {}, HTMLElement, null>) {
    const dates = calender.selectAll('.date').attr('cursor', 'pointer')
    dates
      .filter((d: Date) => d.type === 'date')
      .on('mouseover', function () {
        const date = d3.select(this)
        date.select('path').attr('fill', 'gray')
        date.select('text').attr('fill', 'red')
        date.raise()
      })
      .on('mouseout', function () {
        const date = d3.select(this)
        date.select('path').attr('fill', (date.datum() as Date).color)
        date.select('text').attr('fill', 'black')
      })
    const self = this
    const dayCount = isLeapYear(self.year) ? 366 : 365
    const dayOfMonth = {
      JAN: 31, FEB: isLeapYear(self.year) ? 29 : 28, MAR: 31, APR: 30, MAY: 31, JUN: 30, JUL: 31,
      AUG: 31, SEP: 30, OCT: 31, NOV: 30, DEC: 31,
    }
    const calEndRadius = (startAngle: number, startRadius: number, endAngle: number) =>
      startRadius - (startAngle - endAngle) * (self.radius / 21) / (Math.PI)
    dates
      .filter((d: Date) => d.type === 'monthLabel')
      .on('mouseover', (d: Date) => {
        const month = d
        month.endAngle = divSpiralAngle(
          self.radius, d.startAngle, self.totalAngle, dayCount + 12, dayOfMonth[d.text] + 1,
        )
        month.endRadius = calEndRadius(month.startAngle, month.startRadius, month.endAngle)
        calender.append('path')
          .attr('d', self.generatePath(month, self.center, self.f, self.v))
          .attr('fill', 'none').attr('stroke', 'red').attr('class', 'month-border')
      })
      .on('mouseout', function () {
        calender.select('.month-border').remove()
      })
  }

  private generatePath(d: Date, center: Point, f: number, v: number): string {
    let path = `M${center.x + d.startRadius * Math.sin(d.startAngle)}
     ${center.y + d.startRadius * Math.cos(d.startAngle)} `
    let angle = d.startAngle
    let r = d.startRadius
    while (angle > d.endAngle) {
      path += `L${center.x + r * Math.sin(angle)}  ${center.y + r * Math.cos(angle)} `
      angle -= Math.PI / f
      r -= v
    }
    path += `L${center.x + (d.endRadius) * Math.sin(d.endAngle)}${' '}
    ${center.y + (d.endRadius) * Math.cos(d.endAngle)}`
    path += `L${center.x + (d.endRadius - 2 * f * v) * Math.sin(d.endAngle - 2 * Math.PI)}${' '}
    ${center.y + (d.endRadius - 2 * f * v) * Math.cos(d.endAngle - 2 * Math.PI)}`
    angle = d.endAngle - 2 * Math.PI
    r = d.endRadius - 2 * f * v
    while (angle < d.startAngle - 2 * Math.PI) {
      path += `L${center.x + r * Math.sin(angle)}  ${center.y + r * Math.cos(angle)} `
      angle += Math.PI / f
      r += v
    }
    path += `L${center.x + (d.startRadius - 2 * f * v) * Math.sin(d.startAngle - 2 * Math.PI)}${' '}
    ${center.y + (d.startRadius - 2 * f * v) * Math.cos(d.startAngle - 2 * Math.PI)}`
    path += 'Z'
    return path
  }
}

interface Date {
  text: string, date?: moment.Moment, index: number, type: 'monthLabel' | 'date',
  color: string, startAngle: number, startRadius: number,
  endAngle: number, endRadius: number,
}
/**
 * 根据年份返回一年中日期对应螺旋线上的位置坐标和角度
 * @param  {number} year 输入的年份
 * @param  {number} radius 最长半径
 * @param  {number} angle 转过总角度
 * @param  {number} v 转过f度时对应的线速度
 * @param  {number} f 角速度
 * @return {Date[]} 返回每月每日的位置
 */
function generateYearData(year: number, radius: number, angle: number, v: number, f: number) {
  const dayName: string[] = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
  const monthName: string[] = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const dateArray: Date[] = []
  const dayCount = isLeapYear(year) ? 366 : 365
  const colorScale = d3.scaleLinear().domain([0, 31]).range(['#c2c2c2', "white"])
  let day = moment(`${year}-01-01`, 'YYYY-MM-DD')
  // 上一个的结束角度和半径
  let prevEndAngle: number = null
  let prevEndRadius: number = null
  let index = 0
  const calEndRadius = (startAngle: number, startRadius: number, endAngle: number) =>
    startRadius - (startAngle - endAngle) * f * v / (Math.PI)
  while (day.isBefore(moment(`${year + 1}-01-01`, 'YYYY-MM-DD'))) {
    if (dateArray.length >= 1) {
      prevEndAngle = dateArray[dateArray.length - 1].endAngle
      prevEndRadius = dateArray[dateArray.length - 1].endRadius
    }

    if (day.date() === 1) {
      const monthLabel: Date = {
        color: 'gray',
        endAngle: divSpiralAngle(radius, prevEndAngle ? prevEndAngle : angle, angle, dayCount + 12),
        endRadius: 0,
        index,
        startAngle: prevEndAngle ? prevEndAngle : angle,
        startRadius: prevEndRadius ? prevEndRadius : radius,
        text: monthName[day.month()],
        type: 'monthLabel',
      }
      monthLabel.endRadius = calEndRadius(monthLabel.startAngle, monthLabel.startRadius, monthLabel.endAngle)
      dateArray.push(monthLabel)
      prevEndAngle = monthLabel.endAngle
      prevEndRadius = monthLabel.endRadius
      index += 1
    }
    const date: Date = {
      color: colorScale(day.date()),
      date: day,
      endAngle: divSpiralAngle(radius, prevEndAngle, angle, dayCount + 12),
      endRadius: 0,
      index,
      startAngle: prevEndAngle,
      startRadius: prevEndRadius,
      text: `${dayName[day.day()]}${day.date()} `,
      type: 'date',
    }
    date.endRadius = calEndRadius(date.startAngle, date.startRadius, date.endAngle)
    dateArray.push(date)
    day = day.clone().add(1, 'd')
    index += 1
  }
  return dateArray
}

/**
 * 判断闰年函数
 * @param  {number} year 要判断的年份
 * @return {boolean} 返回布尔值
 * 其实只要满足下面几个条件即可、
 * 1.普通年能被4整除且不能被100整除的为闰年。如2004年就是闰年,1900年不是闰年
 * 2.世纪年能被400整除的是闰年。如2000年是闰年，1900年不是闰年
 */
function isLeapYear(year: number): boolean {
  return !(year % (year % 100 ? 4 : 400));
}
/**
 * 估计等分为一定长度的螺旋线对应的角度，用二分法逼近
 * @param  {number} radius 要计算的起始径长
 * @param  {number} startAnlge 要计算的起始角度
 * @param  {number} allAngle 转过的总角度
 * @param  {number} count 等分数
 * @return {number} 返回角度值
 */
function divSpiralAngle(radius: number, startAngle: number, allAngle: number, count: number, num = 1): number {
  const cal = (a: number) => (a * Math.sqrt(1 + a * a) + Math.log(a + Math.sqrt(1 + a * a)))
  const totalLength = 0.5 * radius * (cal(allAngle) - cal(4 * Math.PI))
  const target = cal(startAngle) - (totalLength / count) * 2 / radius * num
  let left = 4 * Math.PI
  let right = startAngle
  while (left < right) {
    const mid = (left + right) / 2
    // 0.001 为 匹配时的阈值
    if (Math.abs(cal(mid) - target) < 0.001) {
      return mid
    } else if (cal(mid) > target) {
      right = mid
    } else {
      left = mid
    }
  }
  return left
}

export default CalenderSpiral