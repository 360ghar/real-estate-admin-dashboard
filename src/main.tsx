import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import App from './App'
import './index.css'
import { store } from './store'
import { ThemeProvider } from '@/components/theme-provider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <TooltipProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
)
