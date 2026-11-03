import { createFileRoute } from '@tanstack/react-router'
import { LockKeyhole, ArrowRight, ShieldCheck } from 'lucide-react'
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
        <div className="facial-expectation-round" style={{ maxWidth: 460, margin: '24px auto', textAlign: 'left' }}>
          <div className="facial-scan-avatar">
            <img
              src="/img/facial-scan.jpg"
              alt="Facial recognition verification scan preview"
            />
            <div className="facial-scan-badge">
              <ShieldCheck size={14} />
            </div>
          </div>
          <div className="facial-scan-text">
            <div className="eyebrow">WHAT TO EXPECT</div>
            <h3>Quick, secure facial recognition</h3>
            <p>
              Hold your smartphone at eye level and glance into the camera. The scan takes under 30 seconds to confirm your face matches your uploaded ID.
            </p>
          </div>
        </div>
        <div className="notice-box" style={{ maxWidth: 460, margin: '0 auto 24px' }}>
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
