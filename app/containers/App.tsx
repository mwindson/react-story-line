import d3 from 'd3'
import * as React from 'react';
import { Button, ButtonToolbar } from 'react-bootstrap'
import Calender from '../compontents/Calender/Calender'
import Clock from '../compontents/Clock'
import '../style/App.styl'
interface AppProps { compiler: string; framework: string; }
interface AppState { currTimeIndex: number, timeSeq: TimeSeq[], layout: string }
interface TimeSeq { time: string, content: string }

export default class App extends React.Component<{}, AppState> {

  constructor(props: AppProps) {
    super(props)
    this.state = {
      currTimeIndex: 0,
      layout: 'single',
      timeSeq: [],
    }
  }

  componentDidMount() {
    const { currTimeIndex } = this.state
    this.fetchData()
  }

  fetchData = async () => {
    const response = await fetch('../../app/data.json')
    if (response.ok) {
      const data = await response.json()
      if (data && data.length !== 0) {
        this.setState({ timeSeq: data })
      }
    }
  }

  timeforward = () => {
    this.setState({ currTimeIndex: Math.min(this.state.currTimeIndex + 1, this.state.timeSeq.length - 1) })
  }
  timeBack = () => {
    this.setState({ currTimeIndex: Math.max(this.state.currTimeIndex - 1, 0) })
  }
  changeLayout = () => {
    this.setState({ layout: this.state.layout === 'single' ? 'line' : 'single' })
  }

  render() {
    const { currTimeIndex, timeSeq, layout } = this.state
    return (
      <div className="story-line">
        <div className="buttons-part">
          <Button onClick={() => this.timeBack()}>上一个</Button>
          <Button onClick={() => this.timeforward()}>下一个</Button>
          <Button onClick={() => this.changeLayout()} style={{ marginLeft: 40 }}>{layout}</Button>
        </div>
        <Calender width={1600} height={900} layout={'spiral'} startAngle={0} year={2017} />
      </div >
    )
  }
}