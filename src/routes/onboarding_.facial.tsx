import { createFileRoute } from '@tanstack/react-router'
import { LockKeyhole, ArrowRight } from 'lucide-react'
import { Header, Footer } from '../components/Shared'
export const Route = createFileRoute('/onboarding_/facial')({
  head: () => ({
    meta: [
      { title: 'Secure facial verification | AccessPro' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: Facial,
})
function Facial() {
  return (
    <>
      <Header />
      <main className="center-page">
        <div className="success-symbol">
          <LockKeyhole size={28} />
        </div>
        <div className="eyebrow" style={{ justifyContent: 'center' }}>
          YOUR IDENTITY. SECURELY VERIFIED.
        </div>
        <h1>
          A secure link is
          <br />
          <em>your next step.</em>
        </h1>
        <p>
          Facial verification is available through a personal, time-limited
          invitation after your document checks are complete. Open the link in
          your verification email to continue.
        </p>
        <div className="notice-box">
          Facial verification is not yet connected for this property. No
          identity check or building access can be completed on this page.
        </div>
        <a href="/onboarding" className="button primary">
          Register as a professional <ArrowRight size={17} />
        </a>
      </main>
      <Footer />
    </>
  )
}
