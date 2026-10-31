import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  ShieldCheck,
  LockKeyhole,
  Check,
  Mail,
  FileCheck,
  Clock3,
} from 'lucide-react'
import { Header, Footer, useRegion, regions, image } from '../components/Shared'
export const Route = createFileRoute('/onboarding')({
  head: () => ({ meta: [{ title: 'Professional registration | AccessPro' }] }),
  component: Onboarding,
})
function Onboarding() {
  const regional = useRegion()
  const [step, setStep] = useState(0)
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [data, setData] = useState({
    name: '',
    email: '',
    phone: '',
    profession: '',
    company: '',
    postal: '',
    invitation: '',
    access: 'single',
    visitDate: '',
    ssn: '',
    consent: false,
  })
  const update = (key: string, value: string | boolean) =>
    setData((prev) => ({ ...prev, [key]: value }))
  async function submit() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const form = new FormData()
      Object.entries(data).forEach(([k, v]) => form.append(k, String(v)))
      form.append('region', regional.region)
      form.append('kind', 'professional')
      if (file) form.append('document', file)
      const response = await fetch('/.netlify/functions/register', {
        method: 'POST',
        body: form,
      })
      const body = await response.json()
      if (!response.ok)
        throw new Error(
          body.error || 'Your application couldn’t be saved. Please try again.',
        )
      setSubmitted(true)
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Something went wrong. Please try again.',
      )
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <Header regional={regional} />
      <main className="onboarding-layout">
        <aside className="onboarding-aside">
          <div className="eyebrow">
            YOUR WORK. YOUR IDENTITY. YOUR NEXT STEP.
          </div>
          <h1>
            Good work.
            <br />
            Great first
            <br />
            <em>impressions.</em>
          </h1>
          <p>
            A simple, secure introduction to the people who trust you with their
            home.
          </p>
          <img
            src={image('modern-home.jpg', 700)}
            alt="A welcoming contemporary home"
          />
          <div className="onboarding-trust">
            <ShieldCheck size={22} />
            <span>
              Private by design.
              <br />
              Built around your peace of mind.
            </span>
          </div>
        </aside>
        <section className="onboarding-content">
          {submitted ? (
            <div className="success-page">
              <div className="success-symbol">
                <FileCheck size={30} />
              </div>
              <div className="eyebrow">YOUR INTRODUCTION IS IN GOOD HANDS</div>
              <h2>Thank you, {data.name.split(' ')[0]}.</h2>
              <p>Your details and document have been securely received.</p>
              <span className="status-pill">
                Documents Received – Initial Review Pending
              </span>
              <div className="notice-box">
                <Mail size={20} />
                <span>
                  After your document has passed the initial checks, a secure,
                  time-limited facial verification link will be sent to{' '}
                  <strong>{data.email}</strong>. No verification email has been
                  sent yet.
                </span>
              </div>
              <p>
                Facial verification and homeowner approval are required before
                any building access can be issued. Keep an eye on your inbox for
                the next step.
              </p>
              <a className="button primary" href="/">
                Back to AccessPro <ArrowRight size={17} />
              </a>
            </div>
          ) : (
            <>
              <div className="progress-label">
                <span>PROFESSIONAL REGISTRATION</span>
                <span>STEP 0{step + 1} OF 03</span>
              </div>
              <div className="progress-track">
                {[0, 1, 2].map((i) => (
                  <span key={i} className={i <= step ? 'active' : ''} />
                ))}
              </div>
              <h2>
                {
                  [
                    'Let’s get acquainted.',
                    'A name. A face. A little trust.',
                    'One last look.',
                  ][step]
                }
              </h2>
              <p className="form-intro">
                {
                  [
                    'Start with a few details about you and the work you do.',
                    'Upload a clear image of your photo ID. Your document stays private.',
                    'Make sure everything looks right before you send your introduction.',
                  ][step]
                }
              </p>
              <form
                className="onboarding-form"
                onSubmit={(e) => {
                  e.preventDefault()
                  setError('')
                  if (step === 0) {
                    if (data.access === 'temporary' && !data.visitDate) {
                      setError('Please choose a visit date.')
                      return
                    }
                    setStep(1)
                  } else if (step === 1) {
                    if (!data.ssn.trim()) {
                      setError(
                        `Please enter your ${regions[regional.region].idLabel}.`,
                      )
                      return
                    }
                    if (!file) {
                      setError('Please upload a photo of your ID.')
                      return
                    }
                    setStep(2)
                  } else void submit()
                }}
              >
                {step === 0 && (
                  <>
                    <label>
                      Full legal name
                      <input
                        required
                        autoComplete="name"
                        maxLength={100}
                        value={data.name}
                        onChange={(e) => update('name', e.target.value)}
                        placeholder="As it appears on your ID"
                      />
                    </label>
                    <label>
                      Email address
                      <input
                        required
                        type="email"
                        autoComplete="email"
                        maxLength={200}
                        value={data.email}
                        onChange={(e) => update('email', e.target.value)}
                        placeholder="you@example.com"
                      />
                      <span className="field-note">
                        Your facial verification link is sent here after
                        document checks.
                      </span>
                    </label>
                    <div className="form-grid">
                      <label>
                        Country
                        <select
                          value={regional.region}
                          onChange={(e) => regional.setRegion(e.target.value)}
                        >
                          {Object.entries(regions).map(([k, r]) => (
                            <option key={k} value={k}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Phone number
                        <input
                          required
                          type="tel"
                          autoComplete="tel"
                          minLength={7}
                          maxLength={25}
                          value={data.phone}
                          onChange={(e) => update('phone', e.target.value)}
                          placeholder={`${regions[regional.region].phone} phone number`}
                        />
                      </label>
                    </div>
                    <div className="form-grid">
                      <label>
                        Your profession
                        <select
                          required
                          value={data.profession}
                          onChange={(e) => update('profession', e.target.value)}
                        >
                          <option value="">Select your profession</option>
                          {[
                            'Cleaning professional',
                            'Electrician',
                            'Plumber',
                            'Carpenter',
                            'Maintenance professional',
                            'Care professional',
                            'Other service professional',
                          ].map((v) => (
                            <option key={v}>{v}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Company <span className="field-note">Optional</span>
                        <input
                          maxLength={100}
                          value={data.company}
                          onChange={(e) => update('company', e.target.value)}
                          placeholder="Company or self-employed"
                        />
                      </label>
                    </div>
                    <div className="form-grid">
                      <label>
                        {regions[regional.region].postal}
                        <input
                          required
                          autoComplete="postal-code"
                          maxLength={12}
                          value={data.postal}
                          onChange={(e) => update('postal', e.target.value)}
                          placeholder={
                            regional.region === 'US'
                              ? 'e.g. 90210'
                              : regional.region === 'CA'
                                ? 'e.g. M5V 2T6'
                                : regional.region === 'GB'
                                  ? 'e.g. SW1A 1AA'
                                  : 'e.g. 2000'
                          }
                        />
                      </label>
                      <label>
                        Property invitation reference
                        <span className="field-note">
                          Optional, if provided by your homeowner
                        </span>
                        <input
                          maxLength={80}
                          value={data.invitation}
                          onChange={(e) => update('invitation', e.target.value)}
                          placeholder="Your invitation reference"
                        />
                      </label>
                    </div>
                    <label>
                      Requested access
                      <select
                        value={data.access}
                        onChange={(e) => update('access', e.target.value)}
                      >
                        <option value="single">One visit</option>
                        <option value="temporary">
                          Temporary access on a specific date
                        </option>
                        <option value="recurring">Recurring visits</option>
                      </select>
                    </label>
                    {data.access === 'temporary' && (
                      <label>
                        Requested visit date
                        <input
                          type="date"
                          required
                          value={data.visitDate}
                          onChange={(e) => update('visitDate', e.target.value)}
                          min={new Date().toISOString().slice(0, 10)}
                        />
                        <span className="field-note">
                          Your homeowner must approve the exact access window.
                        </span>
                      </label>
                    )}
                  </>
                )}
                {step === 1 && (
                  <>
                    <label>
                      Accepted document
                      <span className="notice-box">
                        <FileCheck size={19} />
                        {regions[regional.region].document}
                      </span>
                    </label>
                    <label>
                      {regions[regional.region].idLabel}
                      <span className="field-note">
                        {regions[regional.region].idDescription}
                      </span>
                      <input
                        required
                        maxLength={30}
                        value={data.ssn}
                        onChange={(e) => update('ssn', e.target.value)}
                        placeholder={regions[regional.region].idPlaceholder}
                      />
                    </label>
                    <label className="upload-zone">
                      <UploadCloud size={31} />
                      <strong>
                        {file ? file.name : 'Choose your photo ID'}
                      </strong>
                      <span>
                        {file
                          ? `${(file.size / 1024 / 1024).toFixed(1)} MB · Select to replace`
                          : 'Click to browse or use your device camera'}
                        <br />
                        JPG or PNG · Maximum 4 MB
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          setError('')
                          if (f) {
                            if (
                              !['image/jpeg', 'image/png'].includes(f.type) ||
                              f.size > 4 * 1024 * 1024
                            ) {
                              setError('Choose a JPG or PNG under 4 MB.')
                              setFile(null)
                            } else setFile(f)
                          }
                        }}
                      />
                    </label>
                    <div className="notice-box">
                      <LockKeyhole size={18} />
                      <span>
                        Upload only your own document. Make sure all four
                        corners are visible and the text is readable. Your ID
                        image is stored privately and is never sent to Google
                        Sheets.
                      </span>
                    </div>
                    <p className="field-note">
                      This upload receives your document for review. It does not
                      automatically verify your identity or enable property
                      access.
                    </p>
                  </>
                )}
                {step === 2 && (
                  <>
                    <dl className="summary-list">
                      {[
                        ['Full name', data.name],
                        ['Email', data.email],
                        ['Country', regions[regional.region].name],
                        ['Profession', data.profession],
                        [regions[regional.region].idLabel, data.ssn],
                        ['Document', file?.name || ''],
                        [
                          'Requested access',
                          data.access === 'temporary'
                            ? `Temporary · ${data.visitDate}`
                            : data.access === 'single'
                              ? 'One visit'
                              : 'Recurring visits',
                        ],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <dt>{k}</dt>
                          <dd>{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="notice-box">
                      <Clock3 size={18} />
                      <span>
                        Next: initial document checks, then a secure email link
                        for facial verification. Access always requires
                        homeowner approval.
                      </span>
                    </div>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        required
                        checked={data.consent}
                        onChange={(e) => update('consent', e.target.checked)}
                      />
                      <span>
                        I confirm this is my own identity document and agree to
                        my details being used for registration and verification,
                        as described in the{' '}
                        <a href="/privacy">privacy notice</a>.
                      </span>
                    </label>
                  </>
                )}
                {error && (
                  <p role="alert" className="form-error">
                    {error}
                  </p>
                )}
                <div className="form-controls">
                  {step > 0 ? (
                    <button
                      disabled={busy}
                      type="button"
                      className="back-button"
                      onClick={() => {
                        setStep(step - 1)
                        setError('')
                      }}
                    >
                      <ArrowLeft size={15} /> Go back
                    </button>
                  ) : (
                    <span className="field-note">
                      <LockKeyhole
                        size={12}
                        style={{ display: 'inline', verticalAlign: 'middle' }}
                      />{' '}
                      Your details stay private
                    </span>
                  )}
                  <button
                    className="button primary"
                    type="submit"
                    disabled={busy}
                  >
                    {busy
                      ? 'Securely submitting…'
                      : step === 2
                        ? 'Submit my introduction'
                        : 'Continue'}
                    {step === 2 ? (
                      <Check size={16} />
                    ) : (
                      <ArrowRight size={16} />
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
