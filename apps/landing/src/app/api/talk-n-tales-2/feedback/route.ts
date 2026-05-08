// app/api/talk-n-tales-2/feedback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/*
  ── Supabase table: talk_n_tales_2_feedback ─────────────────────────────────
  Run this SQL in your Supabase SQL editor to create the table:

  CREATE TABLE talk_n_tales_2_feedback (
    id                   uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
    name                 text        NOT NULL,
    company              text,
    overall_satisfaction smallint    CHECK (overall_satisfaction BETWEEN 1 AND 5),
    enjoyed_session      text,
    meaningful_connections text,
    venue_rating         smallint    CHECK (venue_rating BETWEEN 1 AND 5),
    event_flow_rating    smallint    CHECK (event_flow_rating BETWEEN 1 AND 5),
    roundtable_rating    smallint    CHECK (roundtable_rating BETWEEN 1 AND 5),
    discussion_relevance text,
    roundtable_joined    text,
    speaker_rating       smallint    CHECK (speaker_rating BETWEEN 1 AND 5),
    mediator_rating      smallint    CHECK (mediator_rating BETWEEN 1 AND 5),
    mediator_engaging    text,
    enjoyed_most         text,
    improvements         text,
    join_future_events   text,
    recommend            text,
    created_at           timestamptz DEFAULT now()
  );

  -- Optional: enable RLS and restrict inserts to service role only
  ALTER TABLE talk_n_tales_2_feedback ENABLE ROW LEVEL SECURITY;
  ────────────────────────────────────────────────────────────────────────── */

// ─── Allowed enum values ──────────────────────────────────────────────────────

const ALLOWED_SESSIONS = new Set([
  'Group Game Session',
  'Senior Founder Roundtable',
  'Speed Networking',
  'Connection & Collaboration Exploration',
]);

const ALLOWED_CONNECTIONS = new Set(['Yes', 'Maybe', 'No']);

const ALLOWED_RELEVANCE = new Set([
  'Very Relevant', 'Relevant', 'Neutral', 'Less Relevant', 'Not Relevant',
]);

const ALLOWED_ROUNDTABLES = new Set([
  'Navigating Investors and Raising Smart',
  "Scaling When It's Still Early",
  'Building Brands People Actually Want',
  "Running a Business That's Also Art",
  'Leading Yourself, Building for Others',
  'Building Partnerships That Actually Work',
]);

const ALLOWED_MEDIATOR_ENGAGING = new Set(['Yes', 'Somewhat', 'No']);
const ALLOWED_YES_MAYBE_NO      = new Set(['Yes', 'Maybe', 'No']);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitize(val: unknown): string {
  if (typeof val !== 'string') return '';
  return val.trim().replace(/<[^>]*>/g, '').replace(/[^\S\r\n]+/g, ' ').slice(0, 2000);
}

function starRating(val: unknown): number | null {
  const n = Number(val);
  if (!Number.isInteger(n) || n < 1 || n > 5) return null;
  return n;
}

function optionalEnum(val: unknown, allowed: Set<string>): string | null {
  const s = sanitize(val);
  if (!s) return null;
  return allowed.has(s) ? s : null;
}

interface ApiResponse { success: boolean; message: string; }

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function bad(message: string): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, message }, { status: 400 });
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    let raw: Record<string, unknown>;
    try { raw = await req.json(); }
    catch { return bad('Invalid JSON body.'); }

    if (typeof raw !== 'object' || raw === null || Array.isArray(raw))
      return bad('Request body must be a JSON object.');

    // Required
    const name = sanitize(raw.name);
    if (!name || name.length < 2) return bad('Name is required (min 2 characters).');
    if (name.length > 100)        return bad('Name exceeds maximum length of 100 characters.');

    // Optional text
    const company = sanitize(raw.company).slice(0, 100) || null;

    // Star ratings — all optional
    const overall_satisfaction = starRating(raw.overall_satisfaction);
    const venue_rating         = starRating(raw.venue_rating);
    const event_flow_rating    = starRating(raw.event_flow_rating);
    const roundtable_rating    = starRating(raw.roundtable_rating);
    const speaker_rating       = starRating(raw.speaker_rating);
    const mediator_rating      = starRating(raw.mediator_rating);

    // Enum fields — all optional
    const enjoyed_session      = optionalEnum(raw.enjoyed_session,       ALLOWED_SESSIONS);
    const meaningful_connections = optionalEnum(raw.meaningful_connections, ALLOWED_CONNECTIONS);
    const discussion_relevance = optionalEnum(raw.discussion_relevance,  ALLOWED_RELEVANCE);
    const roundtable_joined    = optionalEnum(raw.roundtable_joined,     ALLOWED_ROUNDTABLES);
    const mediator_engaging    = optionalEnum(raw.mediator_engaging,     ALLOWED_MEDIATOR_ENGAGING);
    const join_future_events   = optionalEnum(raw.join_future_events,    ALLOWED_YES_MAYBE_NO);
    const recommend            = optionalEnum(raw.recommend,             ALLOWED_YES_MAYBE_NO);

    // Open text
    const enjoyed_most  = sanitize(raw.enjoyed_most).slice(0, 2000) || null;
    const improvements  = sanitize(raw.improvements).slice(0, 2000) || null;

    const { error: dbError } = await supabase
      .from('talk_n_tales_2_feedback')
      .insert([{
        name, company,
        overall_satisfaction, enjoyed_session, meaningful_connections,
        venue_rating, event_flow_rating,
        roundtable_rating, discussion_relevance, roundtable_joined, speaker_rating,
        mediator_rating, mediator_engaging,
        enjoyed_most, improvements, join_future_events, recommend,
        created_at: new Date().toISOString(),
      }]);

    if (dbError) {
      console.error('[TNT2 Feedback]', dbError.message);
      throw new Error(`Database error: ${dbError.message}`);
    }

    return NextResponse.json(
      { success: true, message: 'Feedback submitted. Thank you!' },
      { status: 200 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Submission failed';
    console.error('[TNT2 Feedback]', msg);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
