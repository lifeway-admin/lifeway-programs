import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AnnouncementBar from './components/AnnouncementBar'
import MobileCallButton from './components/MobileCallButton'
import ScrollToTop from './components/ScrollToTop'
import PageTitle from './components/PageTitle'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Team from './pages/Team'
import Contact from './pages/Contact'
import Book from './pages/Book'
import Donate from './pages/Donate'
import Faq from './pages/Faq'
import Privacy from './pages/Privacy'
import Hipaa from './pages/Hipaa'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <PageTitle />
      <div className="flex flex-col min-h-screen">
        <AnnouncementBar />
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/team" element={<Team />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/book" element={<Book />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/hipaa" element={<Hipaa />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <MobileCallButton />
        <ScrollToTop />
      </div>
    </BrowserRouter>
  )
}
