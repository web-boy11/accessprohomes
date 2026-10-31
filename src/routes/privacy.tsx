import { createFileRoute } from '@tanstack/react-router'
import { Header, Footer } from '../components/Shared'
export const Route = createFileRoute('/privacy')({
  head: () => ({ meta: [{ title: 'Privacy & your data | AccessPro' }] }),
  component: () => (
    <>
      <Header />
      <main className="privacy-page">
        <div className="eyebrow">PERSONAL INFORMATION STAYS PERSONAL</div>
        <h1>Privacy, by design.</h1>
        <p>
          AccessPro collects registration information to help homeowners assess
          service-professional access requests. This notice explains the
          information collected by this registration service.
        </p>
        <h2>What we collect</h2>
        <p>
          Professional applications include your name, email, phone number,
          country, profession, optional company, postal code, optional property
          invitation reference, requested access, consent, and an uploaded photo
          ID. Homeowner enquiries include a name, email, and country. Do not
          upload anyone else’s identity document.
        </p>
        <h2>How information is stored and shared</h2>
        <p>
          Application records are stored in a managed PostgreSQL database.
          Identity images are held in private object storage with no public
          download route. When an authorized Google Sheets connection is
          configured, registration details and application status are copied to
          the application owner’s designated Sheet. Identity images,
          document-storage references, and verification credentials are not
          included in the Sheet.
        </p>
        <h2>Verification and property access</h2>
        <p>
          Receiving an application does not verify identity. Document checks,
          facial verification, email delivery, and smart-lock access require
          separately connected providers. No access code is issued solely
          because a form was submitted. This site does not currently perform
          biometric processing.
        </p>
        <h2>Control and retention</h2>
        <p>
          Only submit information if you agree to this registration process.
          Contact the homeowner who invited you to request access to, correction
          of, or deletion of your application. The application operator must
          manage retention, remove records when no longer needed, and provide
          any additional regional disclosures before enabling live
          identity-verification providers.
        </p>
        <h2>Cookies and local preferences</h2>
        <p>
          Your selected country is stored in your browser so the registration
          uses familiar regional formats. This service does not require
          advertising cookies.
        </p>
        <p>
          <a href="/">Return to AccessPro →</a>
        </p>
      </main>
      <Footer />
    </>
  ),
})
