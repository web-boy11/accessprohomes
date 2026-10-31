import { pgTable, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core'
export const applications = pgTable('applications', {
  id: text('id').primaryKey(),
  kind: text('kind').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  region: text('region').notNull(),
  profession: text('profession'),
  company: text('company'),
  postal: text('postal'),
  invitation: text('invitation'),
  access: text('access'),
  visitDate: text('visit_date'),
  ssn: text('ssn'),
  documentKey: text('document_key'),
  status: text('status').notNull().default('initial_review_pending'),
  consent: boolean('consent').notNull(),
  sheetsStatus: text('sheets_status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
export const submissionLimits = pgTable('submission_limits', {
  id: text('id').primaryKey(),
  count: integer('count').notNull().default(1),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
})
