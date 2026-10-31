# AccessPro

A refined, responsive home-security website with real architectural photography and a three-step professional registration flow. Built with React 19, TanStack Start, TypeScript, Tailwind CSS, Lucide icons, Netlify Functions, Netlify Database (PostgreSQL + Drizzle), and private Netlify Blobs storage. Images are stored locally and served through Netlify Image CDN.

## Run locally

Use Node 22.13+ or 24 and pnpm:

```sh
pnpm install
netlify dev --port 8889
```

Deploys generate route types and apply database migrations. Do not apply migrations manually. The build pipeline uses the existing build script.

## Included functionality

The homepage includes mobile navigation, homeowner enquiries, a service explanation, expandable FAQs, and registration links. Country settings support United States, Canada, United Kingdom, and Australia, with browser-locale detection, phone prefixes, document guidance, and postal-code validation. Limited French hero copy responds to a French browser locale; the complete site is not localized into French.

Professional registration collects contact information, profession, requested access, an optional property invitation reference, photo ID, and consent. Files are checked for supported image signatures and maximum size. Applications persist in PostgreSQL, and documents persist in private Netlify storage without a public download route. Server-side validation, same-origin checks, persistent hourly submission throttling, and scheduled throttle cleanup are included.

## Google Sheets setup

The supplied spreadsheet is configured in `src/lib/sheets.server.ts`:

`https://docs.google.com/spreadsheets/d/1NLKLzLpHlhk9ueBCmx0BkoIwfV2GQRnYx4-KuGL9v-M/edit`

A sharing URL does not authorize writes. Enable the Google Sheets API, create an approved Google service account, and share the spreadsheet with its email as an editor. Set `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY` as server-only Netlify runtime variables. Never commit credentials.

Rows append to the first worksheet in columns A:M: application ID, creation time, application type, name, email, phone, region, profession, company, postal code, requested access, visit date, status. Add headers before enabling submissions. RAW insertion prevents submitted strings from becoming spreadsheet formulas. Documents, storage keys, invitation references, and access credentials are excluded.

Applications remain saved with `sheets_status=pending` when authorization is missing or delivery fails. Pending records require operator reconciliation; no automatic replay is implemented. Application IDs support checking for duplicates after ambiguous network outcomes. Scope Google credentials to production to avoid preview submissions reaching the live Sheet.

## Private Amazon S3 bucket

`infrastructure/private-documents.yaml` is an AWS CloudFormation template with complete public-access blocking, ACLs disabled, a rotating KMS key, versioning, TLS enforcement, configurable retention, and a limited upload policy. Upload requests must explicitly specify the KMS algorithm and created key ARN. Deleting the stack retains the bucket and key. Expired objects and prior versions follow their separate lifecycle rules.

**The AWS bucket has not been provisioned:** authorized AWS credentials are unavailable in this workspace. An AWS administrator can deploy this template through CloudFormation in the approved region, acknowledge IAM-resource creation, and confirm the retention period. The template creates no public endpoints, user accounts, or access keys.

Runtime storage uses Netlify Blobs as required by this hosting environment. The AWS template is a separate infrastructure deliverable; application uploads do not currently go to S3.

## Remaining production integrations

The site accepts applications; it does not yet create authenticated accounts or grant property access. Clerk/Auth.js, identity-verification providers, transactional email, and smart locks are not configured. The `/onboarding/facial` route explains that a personal invitation and connected provider are required; it never accepts a fabricated verification or issues a PIN.

Applications start in `initial_review_pending`. Only successful real document checks should transition them to **Documents Received – Facial Verification Pending**. A future provider connection must generate a cryptographically random single-use invitation, store only its hash and expiration, send it through a verified email sender, and redeem it atomically with an actual identity provider. Facial results require authenticated provider webhooks. Homeowner approval and an authorized smart lock must precede any named, expiring credential. Add replay protection, account authorization, webhook verification, error recovery, and provider-enforced expiry when connecting those services.

Before real identity documents are collected, the operator must establish authorized review, contact information, regional notices, and a retention/deletion procedure. Private Blobs files have no automatic retention rule. There is intentionally no public administrative or document-reading endpoint.

No local build, test, type-check, or development-server commands were run during creation; deployment validation remains pending.
