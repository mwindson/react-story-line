import d3 from 'd3'
import * as React from 'react';
import { Button, ButtonToolbar, DropdownButton, MenuItem, Nav, Navbar, NavDropdown, NavItem } from 'react-bootstrap'
import Calender from '../compontents/Calender/Calender'
import Clock from '../compontents/Clock/Clock'
import '../style/App.styl'
interface AppProps { compiler: string; framework: string; }
interface AppState { currTimeIndex: number, timeSeq: TimeSeq[], layout: string, dateLevel: 'year' | 'month' | 'day' } }
interface TimeSeq { time: string, content: string }

export default class App extends React.Component<{}, AppState> {

  constructor(props: AppProps) {
    super(props)
    this.state = {
      currTimeIndex: 0,
      dateLevel: 'year',
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
  changeLevel = (dateLevel: 'year' | 'month' | 'day') => {
    this.setState({ dateLevel })
  }
  render() {
    const { currTimeIndex, timeSeq, layout, dateLevel } = this.state
    return (
      <div className="story-line">
        <div className="nav">
          <Navbar inverse collapseOnSelect>
            <Navbar.Header>
              <Navbar.Brand>
                <a href="#">React-Story-line</a>
              </Navbar.Brand>
              <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
              <Nav>
                <NavDropdown eventKey={1} title="Date" id="basic-nav-dropdown">
                  <MenuItem eventKey={1.1} onSelect={() => this.changeLevel('year')}>Year</MenuItem>
                  <MenuItem eventKey={1.2} onSelect={() => this.changeLevel('month')}>Month</MenuItem>
                  <MenuItem eventKey={1.3} onSelect={() => this.changeLevel('day')}>day</MenuItem>
                </NavDropdown>
              </Nav>
              <Nav pullRight>
                <NavItem eventKey={1} href="#">Link Right</NavItem>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        </div>
        <main>
          {dateLevel === 'day' ? <div className="buttons-part">
            <Button onClick={() => this.timeBack()} bsStyle="warning">上一个</Button>
            <Button onClick={() => this.timeforward()} bsStyle="primary">下一个</Button>
            <Button onClick={() => this.changeLayout()} style={{ marginLeft: 40 }}>{layout}</Button>
          </div> : null}
          {dateLevel === 'day' ? <Clock layout={layout} timeIndex={currTimeIndex} timeSeq={timeSeq} /> : null}
          {dateLevel === 'year' ? <Calender width={900} height={900} layout={'spiral'} startAngle={0} year={2017} />
            : null}
        </main>
      </div >
    )
  }
}