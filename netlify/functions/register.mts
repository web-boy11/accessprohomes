import { createHash, randomUUID } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { getStore } from '@netlify/blobs'
import { eq, sql } from 'drizzle-orm'
import { database } from '../../db/index.js'
import { applications, submissionLimits } from '../../db/schema.js'
import { appendToSheet, uploadFileToDrive } from '../../src/lib/sheets.server.js'

function answer(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

export default async function (req: Request) {
  if (req.method !== 'POST') return answer({ error: 'Method not allowed' }, 405)
  const host = req.headers.get('host') || ''
  const isTrustedHost = host.includes('localhost') || host.includes('127.0.0.1') || host.includes('onrender.com') || host.includes('.lhr.life') || host.includes('cloudflare')
  if (!isTrustedHost && req.headers.get('origin') && req.headers.get('origin') !== new URL(req.url).origin)
    return answer({ error: 'Please submit from the AccessPro website.' }, 403)
  if (Number(req.headers.get('content-length') || 0) > 5 * 1024 * 1024)
    return answer(
      { error: 'Your file is too large. Please choose an image under 4 MB.' },
      413,
    )

  let documentKey: string | undefined
  let driveLink: string | null = null
  let saved = false

  try {
    const f = await req.formData()
    const get = (name: string, max = 200) => {
      const value = f.get(name)
      return typeof value === 'string' ? value.trim().slice(0, max) : ''
    }

    const kind = get('kind')
    const name = get('name', 100)
    const email = get('email', 200).toLowerCase()
    const region = get('region', 2)
    const consent = ['true', 'on'].includes(get('consent'))

    if (
      !['homeowner', 'professional'].includes(kind) ||
      name.length < 2 ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      !['US', 'CA', 'GB', 'AU'].includes(region) ||
      !consent
    )
      return answer(
        {
          error:
            'Please complete your name, valid email, country, and consent.',
        },
        400,
      )

    const id = randomUUID()
    const professional = kind === 'professional'
    const phone = get('phone', 25),
      postal = get('postal', 12),
      profession = get('profession', 100),
      access = get('access', 20),
      visitDate = get('visitDate', 10),
      ssn = get('ssn', 30)

    if (professional) {
      const validPostal = (
        {
          US: /^\d{5}(-\d{4})?$/,
          CA: /^[A-Z]\d[A-Z][ -]?\d[A-Z]\d$/i,
          GB: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
          AU: /^\d{4}$/,
        } as Record<string, RegExp>
      )[region]

      if (
        phone.replace(/\D/g, '').length < 7 ||
        phone.replace(/\D/g, '').length > 15 ||
        !profession ||
        !validPostal.test(postal) ||
        !['single', 'temporary', 'recurring'].includes(access)
      )
        return answer(
          {
            error:
              'Check your phone number, local postal code, profession, and requested access.',
          },
          400,
        )

      if (!ssn) {
        const idName =
          ({
            US: 'Social Security Number (SSN)',
            CA: 'Social Insurance Number (SIN)',
            GB: 'National Insurance (NI) Number',
            AU: 'Tax File Number (TFN) / ABN',
          } as Record<string, string>)[region] || 'identity number'
        return answer(
          { error: `Please enter your ${idName}.` },
          400,
        )
      }

      if (
        access === 'temporary' &&
        (!/^\d{4}-\d{2}-\d{2}$/.test(visitDate) ||
          !Number.isFinite(Date.parse(visitDate)) ||
          visitDate < new Date().toISOString().slice(0, 10))
      )
        return answer(
          { error: 'Please choose a valid future visit date.' },
          400,
        )

      const file = f.get('document')
      if (
        !(file instanceof File) ||
        file.size === 0 ||
        file.size > 4 * 1024 * 1024 ||
        !['image/jpeg', 'image/png'].includes(file.type)
      )
        return answer(
          { error: 'Please upload a JPG or PNG photo ID under 4 MB.' },
          400,
        )

      const bytes = new Uint8Array(await file.arrayBuffer())
      const png =
        bytes[0] === 137 &&
        bytes[1] === 80 &&
        bytes[2] === 78 &&
        bytes[3] === 71 &&
        bytes[4] === 13 &&
        bytes[5] === 10 &&
        bytes[6] === 26 &&
        bytes[7] === 10
      const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255

      if (
        (file.type === 'image/png' && !png) ||
        (file.type === 'image/jpeg' && !jpg)
      )
        return answer(
          { error: 'This file is not a valid JPG or PNG image.' },
          400,
        )

      const fileBuffer = Buffer.from(bytes)
      const cleanName = name.replace(/[^a-zA-Z0-9]/g, '_')
      const fileName = `${cleanName}_ID_${randomUUID().slice(0, 8)}.${png ? 'png' : 'jpg'}`

      // 1. Save backup (use /tmp on serverless environments like Netlify where root is read-only)
      try {
        const isServerless = Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME)
        const uploadDir = isServerless
          ? path.join('/tmp', 'uploads', id)
          : path.resolve(process.cwd(), 'uploads', id)
        await fs.mkdir(uploadDir, { recursive: true })
        await fs.writeFile(path.join(uploadDir, fileName), fileBuffer)
        documentKey = `uploads/${id}/${fileName}`
      } catch {
        documentKey = `uploads/${id}/${fileName}`
      }

      // 2. Upload to Google Drive if Drive storage is configured
      try {
        driveLink = await uploadFileToDrive(fileBuffer, fileName, file.type)
      } catch {
        /* Fall back to local key */
      }
    }

    let record = {
      id,
      createdAt: new Date(),
      company: get('company', 100) || null,
      status: professional ? 'initial_review_pending' : 'homeowner_interest_received',
    }

    // Database insertion: Protected so offline / credit-exhausted mode still delivers to Sheets
    try {
      const db = database()
      const ip = req.headers.get('x-nf-client-connection-ip') || 'unknown'
      const slot = Math.floor(Date.now() / 3600000)
      const limiterId = createHash('sha256')
        .update(`accesspro:${slot}:${ip}`)
        .digest('hex')

      const [limit] = await db
        .insert(submissionLimits)
        .values({ id: limiterId, expiresAt: new Date((slot + 2) * 3600000) })
        .onConflictDoUpdate({
          target: submissionLimits.id,
          set: { count: sql`${submissionLimits.count} + 1` },
        })
        .returning({ count: submissionLimits.count })

      if (limit && limit.count > 6)
        return answer(
          { error: 'Too many submissions. Please try again in an hour.' },
          429,
        )

      const [savedRecord] = await db
        .insert(applications)
        .values({
          id,
          kind,
          name,
          email,
          region,
          consent,
          phone: professional ? phone : null,
          profession: professional ? profession : null,
          company: record.company,
          postal: professional ? postal : null,
          invitation: get('invitation', 80) || null,
          access: professional ? access : null,
          visitDate: visitDate || null,
          ssn: professional ? ssn : null,
          documentKey: driveLink || documentKey,
          status: record.status,
        })
        .returning()

      if (savedRecord) {
        record = savedRecord
      }
      saved = true
    } catch {
      // Offline / zero-credit fallback: proceed to Google Sheets
      saved = true
    }

    let synced = false
    try {
      synced = await appendToSheet([
        id,
        record.createdAt instanceof Date ? record.createdAt.toISOString() : new Date().toISOString(),
        kind,
        name,
        email,
        phone || null,
        region,
        profession || null,
        record.company,
        postal || null,
        ssn || null, // Column K: SSN / National ID
        driveLink || documentKey || null, // Column L: ID Card Document (Google Drive Link / Upload)
        access || null, // Column M: Requested Access
        visitDate || null, // Column N: Visit Date
        record.status, // Column O: Status
      ])
    } catch {
      /* Pending sync is recorded; never discard accepted application */
    }

    if (synced) {
      try {
        const db = database()
        await db
          .update(applications)
          .set({ sheetsStatus: 'synced' })
          .where(eq(applications.id, id))
      } catch {
        /* Sync recorded in sheets */
      }
    }

    return answer(
      {
        id,
        status: record.status,
        sheetsStatus: synced ? 'synced' : 'pending',
      },
      201,
    )
  } catch {
    return answer(
      {
        error:
          'Your application could not be saved right now. Please try again.',
      },
      503,
    )
  }
}
