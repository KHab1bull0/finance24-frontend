import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import { installViewportHeight, installViewportProbe } from './lib/viewport'
import App from './App.tsx'

// Before render: the shell reads --app-h, and a first paint at the wrong height
// is the flicker we are trying to remove.
installViewportHeight()
installViewportProbe()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
