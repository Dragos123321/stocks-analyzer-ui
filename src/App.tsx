import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { ScreeningPage } from './pages/ScreeningPage'
import { InsiderPage } from './pages/InsiderPage'
import { FinancialsPage } from './pages/FinancialsPage'
import { FairValuePage } from './pages/FairValuePage'
import { InvestmentScorePage } from './pages/InvestmentScorePage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="screening" element={<ScreeningPage />} />
          <Route path="insider" element={<InsiderPage />} />
          <Route path="financials" element={<FinancialsPage />} />
          <Route path="fair-value" element={<FairValuePage />} />
          <Route path="investment-score" element={<InvestmentScorePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
