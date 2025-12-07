import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import LandingPage from './pages/LandingPage';
import DiscoverPage from './pages/DiscoverPage';
import PlanPage from './pages/PlanPage';
import FlightsPage from './pages/FlightsPage';
import SavedTripsPage from './pages/SavedTripsPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import AskAIPage from './pages/AskAIPage';
import LocalGuidePage from './pages/LocalGuidePage';
import { PrivacyPage, TermsPage, ContactPage } from './pages/LegalPages';
import { Analytics } from "@vercel/analytics/react"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="discover" element={<DiscoverPage />} />
          <Route path="plan" element={<PlanPage />} />
          <Route path="flights" element={<FlightsPage />} />
          <Route path="ask-ai" element={<AskAIPage />} />
          <Route path="local-guide" element={<LocalGuidePage />} />
          <Route path="saved" element={<SavedTripsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="contact" element={<ContactPage />} />
        </Route>
      </Routes>
      <Analytics />
    </Router>
  );
}

export default App;
