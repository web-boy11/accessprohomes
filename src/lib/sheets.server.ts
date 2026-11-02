import { createSign } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

export const SHEET_ID = '1NLKLzLpHlhk9ueBCmx0BkoIwfV2GQRnYx4-KuGL9v-M'

function getCredentials() {
  let email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  let key = process.env.GOOGLE_PRIVATE_KEY
  let driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID

  if (!email || !key) {
    try {
      const envPath = path.resolve(process.cwd(), '.env')
      if (fs.existsSync(envPath)) {
        const env = fs.readFileSync(envPath, 'utf-8')
        for (const line of env.split('\n')) {
          if (line.startsWith('GOOGLE_SERVICE_ACCOUNT_EMAIL=')) {
            email = line.replace('GOOGLE_SERVICE_ACCOUNT_EMAIL=', '').trim().replace(/^"|"$/g, '')
          }
          if (line.startsWith('GOOGLE_DRIVE_FOLDER_ID=')) {
            driveFolderId = line.replace('GOOGLE_DRIVE_FOLDER_ID=', '').trim().replace(/^"|"$/g, '')
          }
        }
        const keyMatch = env.match(/GOOGLE_PRIVATE_KEY="([\s\S]*?)"\r?\n/)
        if (keyMatch) {
          key = keyMatch[1].replace(/\\n/g, '\n')
        }
      }
    } catch {
      // Fallback
    }
  }

  return { email, key, driveFolderId }
}

function encode(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

export function sheetsConfigured() {
  const { email, key } = getCredentials()
  return Boolean(email && key)
}

async function getAccessToken(scope = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive') {
  const { email, key } = getCredentials()
  if (!email || !key) throw new Error('Google credentials not configured')

  const now = Math.floor(Date.now() / 1000)
  const input = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({
    iss: email,
    scope,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 300,
  })}`

  const signer = createSign('RSA-SHA256')
  signer.update(input)
  signer.end()
  const signature = signer.sign(key.replace(/\\n/g, '\n')).toString('base64url')

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: `${input}.${signature}`,
        }),
        signal: AbortSignal.timeout(15000),
      })
      if (!tokenResponse.ok) throw new Error('Google authorization unavailable')
      const token = (await tokenResponse.json()) as { access_token: string }
      return token.access_token
    } catch (err) {
      if (attempt === 3) throw err
      await new Promise((r) => setTimeout(r, 1000))
    }
  }
  throw new Error('Failed to obtain Google token after retries')
}

export async function uploadFileToDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<string | null> {
  const { driveFolderId } = getCredentials()
  try {
    const token = await getAccessToken('https://www.googleapis.com/auth/drive')
    const metadata: Record<string, unknown> = {
      name: fileName,
      mimeType,
    }
    if (driveFolderId) {
      metadata.parents = [driveFolderId]
    }

    // 1. Create file record in Drive
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
      signal: AbortSignal.timeout(15000),
    })
    const file = (await createRes.json()) as { id?: string; webViewLink?: string }
    if (!file.id) return null

    // 2. Upload file content
    const uploadRes = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${file.id}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': mimeType,
        },
        body: fileBuffer,
        signal: AbortSignal.timeout(30000),
      },
    )
    if (!uploadRes.ok) return null

    // 3. Make shareable with link
    try {
      await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}/permissions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'reader', type: 'anyone' }),
        signal: AbortSignal.timeout(8000),
      })
    } catch {
      /* Shared via parent folder */
    }

    return `https://drive.google.com/file/d/${file.id}/view`
  } catch {
    return null
  }
}

export async function appendToSheet(row: (string | null)[]) {
  if (!sheetsConfigured()) return false
  const accessToken = await getAccessToken('https://www.googleapis.com/auth/spreadsheets')

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1!A:O:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ values: [row] }),
          signal: AbortSignal.timeout(15000),
        },
      )
      if (!response.ok) throw new Error('Google Sheets delivery unavailable')
      return true
    } catch (err) {
      if (attempt === 3) throw err
      await new Promise((r) => setTimeout(r, 1000))
    }
  }
  return false
}
