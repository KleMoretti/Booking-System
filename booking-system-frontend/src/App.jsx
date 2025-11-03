import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './store'

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        {/* 路由配置 */}
      </BrowserRouter>
    </Provider>
  )
}

export default App

