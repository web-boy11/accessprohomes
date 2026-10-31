import { createHash, randomUUID } from 'node:crypto'
import { getStore } from '@netlify/blobs'
import { eq, sql } from 'drizzle-orm'
import { database } from '../../db/index.js'
import { applications, submissionLimits } from '../../db/schema.js'
import { appendToSheet } from '../../src/lib/sheets.server.js'
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
  if (req.headers.get('origin') !== new URL(req.url).origin)
    return answer({ error: 'Please submit from the AccessPro website.' }, 403)
  if (Number(req.headers.get('content-length') || 0) > 5 * 1024 * 1024)
    return answer(
      { error: 'Your file is too large. Please choose an image under 4 MB.' },
      413,
    )
  let documentKey: string | undefined
  let saved = false
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
    if (limit.count > 6)
      return answer(
        { error: 'Too many submissions. Please try again in an hour.' },
        429,
      )
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
      visitDate = get('visitDate', 10)
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
      documentKey = `documents/${id}/${randomUUID()}.${png ? 'png' : 'jpg'}`
      await getStore('private-identity-documents').set(
        documentKey,
        bytes.buffer,
      )
    }
    const [record] = await db
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
        company: get('company', 100) || null,
        postal: professional ? postal : null,
        invitation: get('invitation', 80) || null,
        access: professional ? access : null,
        visitDate: visitDate || null,
        documentKey,
        status: professional
          ? 'initial_review_pending'
          : 'homeowner_interest_received',
      })
      .returning()
    saved = true
    let synced = false
    try {
      synced = await appendToSheet([
        id,
        record.createdAt.toISOString(),
        kind,
        name,
        email,
        phone || null,
        region,
        profession || null,
        record.company,
        postal || null,
        access || null,
        visitDate || null,
        record.status,
      ])
    } catch {
      /* Pending sync is recorded in the database; never discard the accepted application. */
    }
    if (synced) {
      try {
        await db
          .update(applications)
          .set({ sheetsStatus: 'synced' })
          .where(eq(applications.id, id))
      } catch {
        /* Application is saved; sync can be reconciled by application ID. */
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
    if (documentKey && !saved) {
      try {
        await getStore('private-identity-documents').delete(documentKey)
      } catch {
        /* Operator can reconcile orphan uploads without disclosing document details. */
      }
    }
    return answer(
      {
        error:
          'Your application could not be saved right now. Your information has not been confirmed as received. Please try again.',
      },
      503,
    )
  }
}
