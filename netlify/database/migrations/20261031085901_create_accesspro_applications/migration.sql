CREATE TABLE "applications" (
	"id" text PRIMARY KEY,
	"kind" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"region" text NOT NULL,
	"profession" text,
	"company" text,
	"postal" text,
	"invitation" text,
	"access" text,
	"visit_date" text,
	"document_key" text,
	"status" text DEFAULT 'initial_review_pending' NOT NULL,
	"consent" boolean NOT NULL,
	"sheets_status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submission_limits" (
	"id" text PRIMARY KEY,
	"count" integer DEFAULT 1 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
