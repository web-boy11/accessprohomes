import { lt } from 'drizzle-orm'
import { database } from '../../db/index.js'
import { submissionLimits } from '../../db/schema.js'
export default async function () {
  await database()
    .delete(submissionLimits)
    .where(lt(submissionLimits.expiresAt, new Date()))
  return new Response(null, { status: 204 })
}
export const config = { schedule: '0 * * * *' }
