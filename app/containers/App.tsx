import 'bootstrap/dist/css/bootstrap.css'
import d3 from 'd3'
import * as React from 'react';
import {
  Button, DropdownItem, DropdownMenu, DropdownToggle,
  Nav, Navbar, NavbarBrand, NavDropdown, NavItem, UncontrolledNavDropdown,
} from 'reactstrap'
import Calender from 'compontents/Calender/Calender'
import Clock from 'compontents/Clock/Clock'
import YearLine from 'compontents/Year/YearLine'
import 'style/App.styl'
import * as menuConfig from 'utils/menu.yaml'

interface AppProps { compiler: string; framework: string; }
interface AppState { currTimeIndex: number, timeSeq: TimeSeq[], layout: string, dateLevel: 'year' | 'month' | 'day' } }
interface TimeSeq { time: string, content: string }

export default class App extends React.Component<{}, AppState> {

  constructor(props: AppProps) {
    super(props)
    this.state = {
      currTimeIndex: 0,
      dateLevel: 'year',
      layout: menuConfig.month[0],
      timeSeq: [],
    }
  }

  componentDidMount() {
    const { currTimeIndex } = this.state
    // this.fetchData()
  }

  fetchData = async () => {
    const response = await fetch('../../app/')
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
  changeLayout = (layout: string) => {
    this.setState({ layout })
  }
  changeLevel = (dateLevel: 'year' | 'month' | 'day') => {
    this.setState({ dateLevel })
  }
  render() {
    const { currTimeIndex, timeSeq, layout, dateLevel } = this.state
    return (
      <div className="story-line">
        <Navbar className="nav-bar" expand >
          <NavbarBrand>react-story-line</NavbarBrand>
          <Nav>
            <UncontrolledNavDropdown>
              <DropdownToggle nav caret>DateLevel</DropdownToggle>
              <DropdownMenu>
                <DropdownItem onClick={() => this.changeLevel('year')}>year</DropdownItem>
                <DropdownItem onClick={() => this.changeLevel('month')}>month</DropdownItem>
                <DropdownItem onClick={() => this.changeLevel('day')}>day</DropdownItem>
              </DropdownMenu>
            </UncontrolledNavDropdown>
            <UncontrolledNavDropdown>
              <DropdownToggle nav caret>Layout</DropdownToggle>
              <DropdownMenu>
                {menuConfig[dateLevel].map((l: string, i: number) =>
                  (<DropdownItem key={i} onClick={() => this.changeLayout(l)}>{l}</DropdownItem>))}
              </DropdownMenu>
            </UncontrolledNavDropdown>
          </Nav>
        </Navbar>
        <main>
          {dateLevel === 'year' ? <YearLine data={timeSeq} /> : null}
          {dateLevel === 'day' ? <Clock layout={layout} timeIndex={currTimeIndex} timeSeq={timeSeq} /> : null}
          {dateLevel === 'month' ?
            <Calender
              width={900}
              height={900}
              layout={layout}
              year={2017}
            /> : null}
        </main>
      </div >
    )
  }
}