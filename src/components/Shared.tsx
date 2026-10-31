import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  ChevronDown,
  Globe2,
  Menu,
  ShieldCheck,
  X,
} from 'lucide-react'
export const regions: Record<
  string,
  {
    name: string
    short: string
    phone: string
    postal: string
    document: string
  }
> = {
  US: {
    name: 'United States',
    short: 'US',
    phone: '+1',
    postal: 'ZIP code',
    document: 'State ID, driver’s license or passport',
  },
  CA: {
    name: 'Canada',
    short: 'CA',
    phone: '+1',
    postal: 'Postal code',
    document: 'Driver’s licence or passport',
  },
  GB: {
    name: 'United Kingdom',
    short: 'UK',
    phone: '+44',
    postal: 'Postcode',
    document: 'Driving licence or passport',
  },
  AU: {
    name: 'Australia',
    short: 'AU',
    phone: '+61',
    postal: 'Postcode',
    document: 'Driver licence or passport',
  },
}
export function useRegion() {
  const [region, setRegion] = useState('US')
  const [language, setLanguage] = useState('en')
  useEffect(() => {
    let saved: string | null = null
    try {
      saved = localStorage.getItem('accesspro-region')
    } catch {
      /* Regional defaults still work if browser storage is blocked. */
    }
    const locale = navigator.language.split('-')[1]?.toUpperCase()
    if (saved && regions[saved]) setRegion(saved)
    else if (locale && regions[locale]) setRegion(locale)
    if (navigator.language.startsWith('fr')) setLanguage('fr')
  }, [])
  const choose = (r: string) => {
    setRegion(r)
    try {
      localStorage.setItem('accesspro-region', r)
    } catch {
      /* The preference still applies for this visit. */
    }
  }
  return { region, setRegion: choose, language, setLanguage }
}
export function image(file: string, width: number) {
  return `/.netlify/images?url=/img/${file}&w=${width}&fm=webp&q=85`
}
export function Header({
  regional,
}: {
  regional?: ReturnType<typeof useRegion>
}) {
  const [menu, setMenu] = useState(false)
  return (
    <header className="header">
      <a className="brand" href="/" aria-label="AccessPro home">
        <span className="brand-icon">
          <ShieldCheck size={25} strokeWidth={1.6} />
        </span>
        Access<span>Pro</span>
        <span className="brand-period">.</span>
      </a>
      <nav className={menu ? 'nav open' : 'nav'} aria-label="Main navigation">
        <a onClick={() => setMenu(false)} href="/#how-it-works">
          How it works
        </a>
        <a onClick={() => setMenu(false)} href="/#for-homeowners">
          For homeowners
        </a>
        <a onClick={() => setMenu(false)} href="/#for-professionals">
          For professionals
        </a>
        <a onClick={() => setMenu(false)} href="/#why-accesspro">
          Why AccessPro
        </a>
      </nav>
      <div className="header-actions">
        {regional && (
          <div className="region-select">
            <Globe2 size={15} />
            <select
              aria-label="Your country"
              value={regional.region}
              onChange={(e) => regional.setRegion(e.target.value)}
            >
              {Object.entries(regions).map(([k, r]) => (
                <option key={k} value={k}>
                  {r.short}
                </option>
              ))}
            </select>
            <ChevronDown size={12} />
          </div>
        )}
        <a href="/onboarding" className="button nav-button">
          Get started <ArrowUpRight size={15} />
        </a>
        <button
          className="mobile-menu"
          onClick={() => setMenu(!menu)}
          aria-label={menu ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menu}
        >
          {menu ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  )
}
export function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <div>
          <a className="brand" href="/">
            <span className="brand-icon">
              <ShieldCheck size={25} />
            </span>
            Access<span>Pro</span>
            <span className="brand-period">.</span>
          </a>
          <p>
            A smarter welcome.
            <br />A safer place to call home.
          </p>
        </div>
        <div className="footer-links">
          <div>
            <span>EXPLORE</span>
            <a href="/#how-it-works">How it works</a>
            <a href="/#for-homeowners">For homeowners</a>
            <a href="/onboarding">For professionals</a>
          </div>
          <div>
            <span>THE DETAILS</span>
            <a href="/privacy">Privacy & your data</a>
            <a href="/#why-accesspro">Our approach</a>
            <a href="/#faq">Common questions</a>
          </div>
          <div>
            <span>MAKE A GOOD INTRODUCTION</span>
            <a href="/onboarding" className="footer-register">
              Your next opportunity
              <br />
              starts with trust. <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} AccessPro. All rights reserved.
        </span>
        <span>
          <Globe2 size={13} /> Thoughtfully built for a world of homes.
        </span>
      </div>
    </footer>
  )
}
