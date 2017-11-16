import * as _ from 'lodash'
import moment from 'moment'
import React, { Component } from 'react'
import YearLineManager from './YearLineManager'
interface Year { time: string, events: string[], count: number, year: number }
interface YearLineProps { data: Year[] }
interface YearLineState { data: Year[] }

class YearLine extends Component<{}, YearLineState> {
  drawManager: YearLineManager
  svg: SVGSVGElement
  constructor(props: YearLineProps) {
    super(props)
    this.state = {
      data: [],
    }
    this.svg = null
    this.drawManager = null
  }

  componentDidMount() {
    this.fetchData()
  }
  fetchData = async () => {
    const response = await fetch('../../app/witcher.json')
    if (response.ok) {
      const data = await response.json()
      if (data && data.length !== 0) {
        const yearData: Year[] = []
        data.forEach((v) => {
          if (v.year.indexOf('到') !== -1) {
            const yArray = v.year.split('到')
            const deltaYear = Math.floor((Number(yArray[0]) - Number(yArray[1])) / (v.count + 1))
            for (let i = 1; i < v.count + 1; i += 1) {
              const y = Number(yArray[0]) - deltaYear * i
              yearData.push({ ...v, year: y, events: [v.events[i - 1]] })
            }
          } else {
            yearData.push({ ...v, year: Number(v.year) })
          }
        })
        console.log(yearData)
        this.drawManager = new YearLineManager(this.svg, yearData)
        this.drawManager.draw()
      }
    }
  }

  render() {
    return (
      <svg width="1200" height="900" ref={(node) => this.svg = node} />
    )
  }
}

export default YearLine