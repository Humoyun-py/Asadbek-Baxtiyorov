import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import './index.css'
import App from './App'
import { PortfolioProvider } from './api/portfolio'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <PortfolioProvider>
        <App />
      </PortfolioProvider>
    </MotionConfig>
  </StrictMode>,
)
