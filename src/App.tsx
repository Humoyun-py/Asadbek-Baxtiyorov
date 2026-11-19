import { useEffect } from 'react'
import { track } from './api/portfolio'
import Testimonials from './sections/Testimonials'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Hero from './sections/Hero'
import About from './sections/About'
import Services from './sections/Services'
import Projects from './sections/Projects'
import UniversityCampaigns from './sections/UniversityCampaigns'
import Results from './sections/Results'
import Agency from './sections/Agency'
import WorkProcess from './sections/WorkProcess'
import Contact from './sections/Contact'

export default function App() {
  useEffect(() => { track('PAGE_VIEW', { path: window.location.pathname }) }, [])
  return (
    <>
      <a href="#projects" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2">Asosiy mazmunga o'tish</a>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Projects />
        <UniversityCampaigns />
        <Results />
        <Testimonials />
        <Agency />
        <WorkProcess />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
