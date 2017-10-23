import * as React from "react";
import * as ReactDOM from "react-dom";
import { AppContainer } from 'react-hot-loader'
import App from './containers/App'

function render(Component: React.ComponentClass) {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>
    , document.getElementById('container'),
  )
}

// initial render
render(App)

declare const module: any
if (module.hot) {
  module.hot.accept('./containers/App.tsx', () => {
    // hot-reload for App
    render(require('./containers/App').default)
  })
}