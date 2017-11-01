import * as d3 from 'd3'
import * as moment from 'moment'

interface Point { x: number, y: number }
class CalenderSpiral {
  svg: d3.Selection<SVGElement, {}, HTMLElement, null>
  radius: number
  center: Point
  constructor(svg: SVGSVGElement, width: number, height: number) {
    this.svg = d3.select(svg)
    this.radius = Math.min(width, height) / 2
    this.center = { x: width / 2, y: height / 2 }
  }

  public draw() {
    this.drawSpiral()
  }

  /**
   * 绘制螺旋线
   *  X=(a+bs)cos(s), Y=(a+bs)sin(s)
   */
  private drawSpiral() {
    let a = 0 // 角度
    let b = 0//  半径
    const v = 0.06 // 直线移动速度
    const f = 360 // 转动速度

    const spiral = d3.line()
    // .curve(d3.curveBasis)
    const spiralData: Array<[number, number]> = []
    while (a <= 21 * Math.PI) {
      const p1: [number, number] = [this.center.x + b * Math.sin(a), this.center.y + 10 + b * Math.cos(a)]
      if (a >= Math.PI * 2) { spiralData.push(p1) }
      a = a + Math.PI / f
      b = b + v
    }
    const center = this.center
    const calender = this.svg.append('g').attr('class', 'calender')
    calender.append('text').text('2017').attr('text-anchor', 'middle').attr('font-size', 40).attr('x', center.x)
      .attr('y', center.y + 20)
    const dates: Date[] = generateYearData(2017, b, a, v)
    const datesPart = calender.append('g').attr('class', 'dates')
    const generatePath = (d: Date): string => {
      let path = `M${center.x + d.startRadius * Math.sin(d.startAngle)}
       ${center.y + 10 + d.startRadius * Math.cos(d.startAngle)} `
      let angle = d.startAngle
      let radius = d.startRadius
      while (angle > d.endAngle) {
        path += `L${center.x + radius * Math.sin(angle)}  ${center.y + 10 + radius * Math.cos(angle)} `
        angle -= Math.PI / f
        radius -= v
      }
      path += `L${center.x + (d.endRadius) * Math.sin(d.endAngle)}${' '}
      ${center.y + 10 + (d.endRadius) * Math.cos(d.endAngle)}`
      path += `L${center.x + (d.endRadius - 2 * f * v) * Math.sin(d.endAngle - 2 * Math.PI)}${' '}
      ${center.y + 10 + (d.endRadius - 2 * f * v) * Math.cos(d.endAngle - 2 * Math.PI)}`
      angle = d.endAngle - 2 * Math.PI
      radius = d.endRadius - 2 * f * v
      while (angle < d.startAngle - 2 * Math.PI) {
        path += `L${center.x + radius * Math.sin(angle)}  ${center.y + 10 + radius * Math.cos(angle)} `
        angle += Math.PI / f
        radius += v
      }
      path += `L${center.x + (d.startRadius - 2 * f * v) * Math.sin(d.startAngle - 2 * Math.PI)}${' '}
      ${center.y + 10 + (d.startRadius - 2 * f * v) * Math.cos(d.startAngle - 2 * Math.PI)}`
      path += 'Z'
      return path
    }
    const datePart = datesPart.selectAll('g').data(dates).enter().append('g')
    datePart.append('path').attr('d', (d: Date) => generatePath(d))
      .attr('fill', (d) => d.color).attr('id', (d) => d.index)
    datePart.append('text').text((d) => d.text)
      .attr('x', (d) => center.x + (d.startRadius - f * v) * Math.sin((d.startAngle + d.endAngle) / 2) - 12)
      .attr('y', (d) => center.y + 15 + (d.startRadius - f * v) * Math.cos((d.startAngle + d.endAngle) / 2))
      .attr('fill', (d) => d.type === 'monthLabel' ? 'white' : 'black')
    // outer border
    calender.append('path').attr('d', spiral(spiralData)).attr('stroke', 'red').attr('fill', 'none')
    calender.selectAll('line').data(dates).enter()
      .append('line')
      .attr('x1', (d) => center.x + d.startRadius * Math.sin(d.startAngle))
      .attr('y1', (d) => center.y + 10 + d.startRadius * Math.cos(d.startAngle))
      .attr('x2', (d) => center.x + (d.startRadius - 2 * f * v) * Math.sin(d.startAngle - 2 * Math.PI))
      .attr('y2', (d) => center.y + 10 + (d.startRadius - 2 * f * v) * Math.cos(d.startAngle - 2 * Math.PI))
      .attr('stroke', 'green')
    calender
      .append('line')
      .datum(dates[dates.length - 1])
      .attr('x1', (d) => center.x + d.endRadius * Math.sin(d.endAngle))
      .attr('y1', (d) => center.y + 10 + d.endRadius * Math.cos(d.endAngle))
      .attr('x2', (d) => center.x + (d.endRadius - 2 * f * v) * Math.sin(d.endAngle - 2 * Math.PI))
      .attr('y2', (d) => center.y + 10 + (d.endRadius - 2 * f * v) * Math.cos(d.endAngle - 2 * Math.PI))
      .attr('stroke', 'green')
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
 * @param  {number} angle 转过360度时对应的线速度
 * @return {boolean} 返回每月每日的位置
 */
function generateYearData(year: number, radius: number, angle: number, v: number) {
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
    startRadius - (startAngle - endAngle) * 360 * v / (Math.PI)
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
function divSpiralAngle(radius: number, startAngle: number, allAngle: number, count: number): number {
  const cal = (a: number) => (a * Math.sqrt(1 + a * a) + Math.log(a + Math.sqrt(1 + a * a)))
  const totalLength = 0.5 * radius * (cal(allAngle) - cal(4 * Math.PI))
  const target = cal(startAngle) - totalLength / count * 2 / radius
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