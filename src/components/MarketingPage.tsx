import { useEffect, useRef, useState } from 'react'
import {
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  ScanFace,
  KeyRound,
  LockKeyhole,
  Check,
  Plus,
  Minus,
  Globe2,
  Fingerprint,
  Clock3,
  BadgeCheck,
  X,
  House,
} from 'lucide-react'
import { Header, Footer, image, useRegion, regions } from './Shared'

const faqs = [
  [
    'How does AccessPro work?',
    'A professional registers their details and identity document. After document checks, they receive a secure link for facial verification. Once verified and approved by the homeowner, a compatible connected lock can provide access for the agreed time window.',
  ],
  [
    'Who can I register for home access?',
    'Cleaners, tradespeople, maintenance teams, carers, and other invited service professionals can apply. The homeowner stays in control of who is approved and when they can enter.',
  ],
  [
    'Can I give someone temporary access?',
    'Yes. You can request access for a specific visit and time window. A credential is only issued after identity verification, homeowner approval, and connection to a supported smart lock.',
  ],
  [
    'How is my personal information protected?',
    'Documents are kept in private storage and are never displayed publicly or added to a Google Sheet. Registration information is shared only with the authorized application destination. You can contact your inviting homeowner to request deletion.',
  ],
  [
    'Does AccessPro work in my country?',
    'Registration is tailored to the United States, Canada, the United Kingdom, and Australia, with local phone and address formats. Identity-document acceptance and connected-lock availability depend on the provider configured for your property.',
  ],
]
export function MarketingPage() {
  const regional = useRegion()
  const [faq, setFaq] = useState<number | null>(0)
  const [homeowner, setHomeowner] = useState(false)
  const fr = regional.language === 'fr'
  return (
    <>
      <Header regional={regional} />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="live-dot" />{' '}
              {fr
                ? 'UNE MAISON SÛRE COMMENCE PAR LA CONFIANCE'
                : 'A SAFER HOME STARTS WITH WHO YOU LET IN'}
            </div>
            <h1>
              {fr ? (
                <>
                  La sérénité.
                  <br />
                  Avant même
                  <br />
                  <em>leur arrivée.</em>
                </>
              ) : (
                <>
                  Peace of mind.
                  <br />
                  Before they
                  <br />
                  <em>step inside.</em>
                </>
              )}
            </h1>
            <p className="hero-description">
              {fr
                ? 'Les bonnes personnes. Le bon accès. Au bon moment. Vérifiez les professionnels qui entrent chez vous, en toute simplicité.'
                : 'The right people. The right access. At the right time. Verify the professionals entering your home, without making life complicated.'}
            </p>
            <div className="hero-actions">
              <button
                className="button primary"
                onClick={() => setHomeowner(true)}
              >
                {fr ? 'Protéger mon foyer' : 'Protect your home'}{' '}
                <ArrowUpRight size={18} />
              </button>
              <a href="/onboarding" className="text-action">
                {fr ? 'Je suis un professionnel' : 'I’m a service professional'}{' '}
                <ArrowRight size={17} />
              </a>
            </div>
            <div className="hero-assurance">
              <span>
                <ShieldCheck size={15} /> Identity-first security
              </span>
              <span className="tiny-dot" />
              <span>No complicated setup</span>
            </div>
            <div className="hero-bottom">
              <span className="mini-home">
                <House size={17} />
              </span>
              <span>
                More confidence at your doorstep.
                <br />
                <strong>More freedom in your day.</strong>
              </span>
              <span className="hand-line" />
            </div>
          </div>
          <div className="hero-photo">
            <img
              src={image('modern-home.jpg', 1500)}
              alt="A beautifully designed modern home with warm lighting, glass walls, and a private garden"
              fetchPriority="high"
            />
            <div className="photo-shade" />
            <div className="photo-top">
              <span className="photo-label">
                <span className="live-dot" /> YOUR SPACE. PROTECTED.
              </span>
              <span className="photo-index">01 / HOME</span>
            </div>
            <div className="verified-card">
              <div className="verified-top">
                <div className="verified-icon">
                  <ShieldCheck size={25} />
                </div>
                <div>
                  <strong>
                    A familiar face.
                    <br />A verified professional.
                  </strong>
                  <span>Confidence, before the door opens.</span>
                </div>
                <span className="card-check">
                  <Check size={15} />
                </span>
              </div>
              <div className="verified-bottom">
                <span>
                  <span className="live-dot" /> Designed around your peace of
                  mind
                </span>
                <LockKeyhole size={14} />
              </div>
            </div>
            <div className="photo-caption">
              <span>
                Feel at home.
                <br />
                <em>Even when you’re away.</em>
              </span>
              <span className="photo-circle">
                <ArrowUpRight size={23} />
              </span>
            </div>
          </div>
        </section>
        <section className="confidence-bar" aria-label="Security principles">
          <span className="confidence-label">
            A little more certainty.
            <br />
            <strong>A lot more peace of mind.</strong>
          </span>
          <span>
            <Fingerprint /> Verified identities
          </span>
          <span>
            <LockKeyhole /> Private by design
          </span>
          <span>
            <Clock3 /> Access on your terms
          </span>
          <span>
            <Globe2 /> Built for your region
          </span>
        </section>
        <section className="section process-section" id="how-it-works">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                THOUGHTFULLY SIMPLE. SECURE AT EVERY STEP.
              </div>
              <h2>
                A smarter welcome.
                <br />
                <em>In a few simple steps.</em>
              </h2>
            </div>
            <p>
              From the first introduction to the front door,
              <br className="desktop" /> we help you take the guesswork out of
              letting someone in.
            </p>
          </div>
          <div className="steps">
            {[
              {
                number: '01',
                icon: BadgeCheck,
                title: 'A proper introduction',
                text: 'Your professional shares their details and a government-issued ID through a simple registration.',
              },
              {
                number: '02',
                icon: ScanFace,
                title: 'A face to the name',
                text: 'After document checks, a secure email link guides them through a quick facial verification.',
              },
              {
                number: '03',
                icon: KeyRound,
                title: 'The right kind of access',
                text: 'You approve the visit. A connected lock provides a personal code for the agreed time window.',
              },
              {
                number: '04',
                icon: House,
                title: 'Get on with your day',
                text: 'Know who is coming, when they can enter, and when their access ends. You stay in control.',
              },
            ].map((s) => (
              <article className="step" key={s.number}>
                <div className="step-top">
                  <span>{s.number}</span>
                  <s.icon size={25} strokeWidth={1.35} />
                </div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </article>
            ))}
          </div>
          <a className="underlined-link" href="/onboarding">
            Start with a simple introduction <ArrowUpRight size={17} />
          </a>
        </section>
        <section className="homeowner-section" id="for-homeowners">
          <div className="interior-photo">
            <img
              loading="lazy"
              src={image('interior.jpg', 1000)}
              alt="A calm, sunlit contemporary living room opening onto a garden"
            />
            <div className="interior-note">
              <ShieldCheck size={23} />
              <span>
                Your home is personal.
                <br />
                <strong>Your security should be, too.</strong>
              </span>
            </div>
          </div>
          <div className="homeowner-copy">
            <div className="eyebrow">FOR THE PLACE YOU CALL HOME</div>
            <h2>
              Let good people in.
              <br />
              <em>Leave worry out.</em>
            </h2>
            <p>
              Your cleaner. Your electrician. The people who keep life running.
              Welcome them with confidence and keep control of your front door.
            </p>
            <div className="feature-line">
              <span>
                <ScanFace size={22} />
              </span>
              <div>
                <h3>Know the person behind the visit</h3>
                <p>
                  Document and facial verification help put a trusted identity
                  to every professional.
                </p>
              </div>
            </div>
            <div className="feature-line">
              <span>
                <Clock3 size={22} />
              </span>
              <div>
                <h3>A visit, not an open invitation</h3>
                <p>
                  Request personal access that starts and ends with the visit.
                  No shared, permanent codes.
                </p>
              </div>
            </div>
            <div className="feature-line">
              <span>
                <Fingerprint size={22} />
              </span>
              <div>
                <h3>Personal information stays personal</h3>
                <p>
                  Private document storage and secure verification links keep
                  sensitive information out of sight.
                </p>
              </div>
            </div>
            <button
              className="text-action green"
              onClick={() => setHomeowner(true)}
            >
              Make your home an AccessPro home <ArrowUpRight size={18} />
            </button>
          </div>
        </section>
        <section
          className="professionals-section section"
          id="for-professionals"
        >
          <div>
            <div className="eyebrow light">
              FOR PEOPLE WHO TAKE PRIDE IN THEIR WORK
            </div>
            <h2>
              Bring your skills.
              <br />
              <em>We’ll help build the trust.</em>
            </h2>
            <p>
              A straightforward introduction. A secure identity check.
              <br />
              More confidence for you and the people you work for.
            </p>
            <a className="button cream" href="/onboarding">
              Register as a professional <ArrowUpRight size={18} />
            </a>
            <span className="small-note">
              Have your photo ID ready. We’ll guide you from there.
            </span>
          </div>
          <div className="professional-illustration">
            <div className="id-card">
              <span className="id-card-brand">
                <ShieldCheck size={19} /> AccessPro{' '}
                <span>PROFESSIONAL PROFILE</span>
              </span>
              <div className="id-profile">
                <div className="profile-avatar">
                  <Fingerprint size={46} strokeWidth={1} />
                </div>
                <div>
                  <span className="profile-label">
                    YOUR PROFESSIONAL IDENTITY
                  </span>
                  <h3>
                    Good work starts
                    <br />
                    with trust.
                  </h3>
                  <span className="profile-tag">
                    <ShieldCheck size={12} /> Built around you
                  </span>
                </div>
              </div>
              <div className="profile-progress">
                <span>INTRODUCE YOURSELF</span>
                <div>
                  <i />
                  <i />
                  <i />
                </div>
                <span>VERIFY. CONNECT. GET TO WORK.</span>
              </div>
            </div>
            <div className="floating-private">
              <LockKeyhole size={16} /> Your details. Always protected.
            </div>
          </div>
        </section>
        <section className="section region-section" id="why-accesspro">
          <div>
            <div className="eyebrow">
              LOCAL UNDERSTANDING. SHARED PEACE OF MIND.
            </div>
            <h2>
              At home.
              <br />
              <em>Wherever home is.</em>
            </h2>
            <p>
              Familiar details make all the difference. AccessPro adapts your
              registration to your region, from phone numbers to the documents
              you use.
            </p>
            <div className="region-pills">
              {Object.entries(regions).map(([key, r]) => (
                <button
                  key={key}
                  className={regional.region === key ? 'active' : ''}
                  onClick={() => regional.setRegion(key)}
                >
                  <span>{r.short}</span>
                  {r.name}
                </button>
              ))}
            </div>
            <div className="region-detail">
              <Globe2 size={18} />
              <span>
                {regions[regional.region].name} ·{' '}
                {regions[regional.region].phone} ·{' '}
                {regions[regional.region].postal} format
              </span>
            </div>
          </div>
          <div className="region-art" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <Globe2 className="globe-art" strokeWidth={0.55} />
            <span className="map-mark mark-us">
              US <span />
            </span>
            <span className="map-mark mark-ca">
              CA <span />
            </span>
            <span className="map-mark mark-uk">
              UK <span />
            </span>
            <span className="map-mark mark-au">
              AU <span />
            </span>
            <span className="global-label">ONE LESS THING TO WORRY ABOUT.</span>
          </div>
        </section>
        <section className="section faq-section" id="faq">
          <div>
            <div className="eyebrow">A LITTLE CLARITY GOES A LONG WAY</div>
            <h2>
              Good questions.
              <br />
              <em>Straight answers.</em>
            </h2>
            <p>
              Security should feel reassuring.
              <br />
              Understanding it should feel simple.
            </p>
          </div>
          <div className="faq-list">
            {faqs.map(([q, a], i) => (
              <div className={`faq-item ${faq === i ? 'open' : ''}`} key={q}>
                <button
                  aria-expanded={faq === i}
                  aria-controls={`faq-${i}`}
                  onClick={() => setFaq(faq === i ? null : i)}
                >
                  {q}
                  {faq === i ? <Minus size={18} /> : <Plus size={18} />}
                </button>
                <div id={`faq-${i}`} hidden={faq !== i}>
                  <p>{a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="closing-section">
          <div className="eyebrow">
            YOUR HOME. YOUR PEOPLE. YOUR PEACE OF MIND.
          </div>
          <h2>
            A more confident welcome
            <br />
            <em>starts right here.</em>
          </h2>
          <button className="button primary" onClick={() => setHomeowner(true)}>
            Let’s make home feel safer <ArrowUpRight size={18} />
          </button>
          <span className="closing-detail">
            <ShieldCheck size={15} /> Thoughtful security. Simply AccessPro.
          </span>
        </section>
      </main>
      <Footer />
      {homeowner && <HomeownerModal onClose={() => setHomeowner(false)} />}
    </>
  )
}
function HomeownerModal({ onClose }: { onClose: () => void }) {
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const dialog = useRef<HTMLElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.current?.querySelector<HTMLElement>('button,input')?.focus()
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') {
        const items = dialog.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]),input:not([type=hidden]),select,a[href]',
        )
        if (!items?.length) return
        const first = items[0],
          last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', listener)
    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', listener)
      previous?.focus()
    }
  }, [onClose])
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        ref={dialog}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="homeowner-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X />
        </button>
        <span className="modal-symbol">
          <House size={26} />
        </span>
        <div className="eyebrow">A MORE CONFIDENT WELCOME</div>
        <h2 id="homeowner-title">
          {sent ? 'You’re on the list.' : 'Start with your home.'}
        </h2>
        {sent ? (
          <>
            <p>
              Your interest has been saved. Our team can contact you about
              property setup and supported locks. No building access is enabled
              yet.
            </p>
            <button className="button primary" onClick={onClose}>
              Back to AccessPro <Check size={18} />
            </button>
          </>
        ) : (
          <>
            <p>
              Tell us where to reach you. We’ll help you get your property ready
              for verified professional access.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                setBusy(true)
                setError('')
                const f = new FormData(e.currentTarget)
                try {
                  const res = await fetch('/.netlify/functions/register', {
                    method: 'POST',
                    body: f,
                  })
                  if (!res.ok)
                    throw new Error(
                      'We couldn’t save your request. Please try again.',
                    )
                  setSent(true)
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'Please try again.')
                } finally {
                  setBusy(false)
                }
              }}
            >
              <input type="hidden" name="kind" value="homeowner" />
              <label>
                Full name
                <input
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={100}
                  placeholder="Your full name"
                />
              </label>
              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                />
              </label>
              <label>
                Country
                <select name="region">
                  {Object.entries(regions).map(([k, r]) => (
                    <option value={k} key={k}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="checkbox-label">
                <input name="consent" type="checkbox" required />I agree to be
                contacted about my AccessPro registration and the use of my
                details as described in the{' '}
                <a href="/privacy">privacy notice</a>.
              </label>
              {error && (
                <p role="alert" className="form-error">
                  {error}
                </p>
              )}
              <button disabled={busy} className="button primary" type="submit">
                {busy ? 'Saving your request…' : 'Get started'}
                <ArrowUpRight size={18} />
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
