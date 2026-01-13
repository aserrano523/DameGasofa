import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
//import "./utils/schedule.test.js";
//import "./utils/isOpenAt.test.js";
//import "./utils/rankStations.test.js";


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
