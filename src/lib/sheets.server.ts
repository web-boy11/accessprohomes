import { createSign } from 'node:crypto'
export const SHEET_ID = '1NLKLzLpHlhk9ueBCmx0BkoIwfV2GQRnYx4-KuGL9v-M'
function encode(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}
export function sheetsConfigured() {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY,
  )
}
export async function appendToSheet(row: (string | null)[]) {
  if (!sheetsConfigured()) return false
  const now = Math.floor(Date.now() / 1000)
  const input = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({ iss: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, scope: 'https://www.googleapis.com/auth/spreadsheets', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 300 })}`
  const signer = createSign('RSA-SHA256')
  signer.update(input)
  signer.end()
  const signature = signer
    .sign(process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'))
    .toString('base64url')
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${input}.${signature}`,
    }),
    signal: AbortSignal.timeout(8000),
  })
  if (!tokenResponse.ok) throw new Error('Google authorization unavailable')
  const token = (await tokenResponse.json()) as { access_token: string }
  // RAW prevents submitted text from being evaluated as spreadsheet formulas.
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A:O:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [row] }),
      signal: AbortSignal.timeout(8000),
    },
  )
  if (!response.ok) throw new Error('Google Sheets delivery unavailable')
  return true
}
