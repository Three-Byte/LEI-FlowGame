import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomeScreen from './components/HomeScreen'
import StatsScreen from './components/StatsScreen'
import AboutScreen from './components/AboutScreen'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/homescreen" replace />} />
        <Route path="/homescreen" element={<HomeScreen />} />
        <Route path="/stats"      element={<StatsScreen />} />
        <Route path="/about"      element={<AboutScreen />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
