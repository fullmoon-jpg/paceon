// app/api/talk-n-tales-2/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { transporter } from '@/lib/utils/emailservice';
import { talkNTales2RegistrationConfirmationTemplate } from '@/app/ui/components/emailtamplatetnt2';

// ─── Allowed enum values ──────────────────────────────────────────────────────

const ALLOWED_INDUSTRIES = new Set([
  'Technology',
  'Creative & Media',
  'E-commerce',
  'Fashion & Lifestyle',
  'Food & Beverage',
  'Education',
  'Sustainability & Climate',
  'Social Impact / NGO',
  'Finance & Fintech',
  'Legal & Compliance',
  'Health & Wellness',
  'Professional Services & Consulting',
  'Other',
]);

const ALLOWED_ROLES = new Set([
  'CEO',
  'COO',
  'CTO',
  'CMO',
  'CFO',
  'Co-Founder',
  'Founder',
  'Managing Director',
  'General Manager',
  'Other',
]);

const ALLOWED_TOPIC_INTERESTS = new Set([
  'Navigating Investors & Raising Smart',
  "Scaling When It's Still Early",
  'Building Brands People Actually Want',
  "Running a Business That's Also Art",
  'Leading Yourself Before Leading Others',
  'Building Partnership That Actually Work',
]);

const ALLOWED_LOOKING_FOR = new Set([
  'Business partners / collaborators',
  'Investors',
  'New connections',
  'Learning from other founders',
  'Potential clients',
]);

// ─── Field length limits ──────────────────────────────────────────────────────

const LIMITS = {
  full_name:        { min: 2,  max: 100 },
  email:            { min: 5,  max: 254 },
  phone:            { min: 7,  max: 20  },
  instagram:        { min: 2,  max: 60  },
  linkedin_url:     { min: 10, max: 200 },
  company:          { min: 1,  max: 100 },
  company_industry: { min: 1,  max: 80  },
  role:             { min: 2,  max: 50  },
  reason:           { min: 10, max: 1000 },
} as const;

// ─── Sanitize ─────────────────────────────────────────────────────────────────

function sanitize(val: unknown): string {
  if (typeof val !== 'string') return '';
  return val
    .trim()
    .replace(/<[^>]*>/g, '')
    .replace(/[^\S\r\n]+/g, ' ')
    .slice(0, 2000);
}

// ─── Regex validators ─────────────────────────────────────────────────────────

const EMAIL_RE     = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const INSTAGRAM_RE = /^@?[a-zA-Z0-9._]{2,30}$/;
const PHONE_RE     = /^[+\d\s\-().]{7,20}$/;
const LINKEDIN_RE  = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in\/)?[a-zA-Z0-9\-_%]{3,100}\/?$/;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiResponse {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
}

interface CleanRegistration {
  full_name: string;
  email: string;
  phone: string;
  instagram: string;
  linkedin_url: string;
  company: string;
  company_industry: string;
  role: string;
  topic_interest: string[];
  reason: string;
  looking_for: string[];
  agree_to_share_data: boolean;
  status: string;
  created_at: string;
}

// ─── Supabase ─────────────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function bad(message: string): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, message }, { status: 400 });
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    // ── 1. Parse ───────────────────────────────────────────────────────────────
    let raw: Record<string, unknown>;
    try {
      raw = await request.json();
    } catch {
      return bad('Invalid JSON body.');
    }

    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
      return bad('Request body must be a JSON object.');
    }

    // ── 2. Sanitize & validate scalar fields ───────────────────────────────────

    const full_name        = sanitize(raw.full_name);
    const email            = sanitize(raw.email).toLowerCase();
    const phone            = sanitize(raw.phone);
    const instagram        = sanitize(raw.instagram).replace(/^@/, '');
    const linkedin_url     = sanitize(raw.linkedin_url);
    const company          = sanitize(raw.company);
    const company_industry = sanitize(raw.company_industry);
    const role             = sanitize(raw.role);
    const reason           = sanitize(raw.reason);

    // Length checks
    for (const [field, val] of Object.entries({
      full_name, email, phone, instagram, linkedin_url,
      company, company_industry, role, reason,
    }) as [keyof typeof LIMITS, string][]) {
      const { min, max } = LIMITS[field];
      if (!val || val.length < min) {
        return bad(`Field "${field}" is required (min ${min} chars).`);
      }
      if (val.length > max) {
        return bad(`Field "${field}" exceeds maximum length of ${max} chars.`);
      }
    }

    // Format checks
    if (!EMAIL_RE.test(email)) {
      return bad('Invalid email address format.');
    }
    if (!PHONE_RE.test(phone)) {
      return bad('Invalid phone number. Use digits, spaces, +, -, or ().');
    }
    if (!INSTAGRAM_RE.test(instagram)) {
      return bad('Invalid Instagram handle (2–30 chars, letters/numbers/._).');
    }
    if (!LINKEDIN_RE.test(linkedin_url)) {
      return bad('Invalid LinkedIn URL. Expected: linkedin.com/in/yourname');
    }

    // Enum checks
    if (!ALLOWED_INDUSTRIES.has(company_industry)) {
      return bad('Invalid industry value.');
    }
    if (!ALLOWED_ROLES.has(role)) {
      return bad('Invalid role value.');
    }

    // ── 3. Validate topic_interest (array) ────────────────────────────────────

    const rawTopicInterest = raw.topic_interest;

    if (!Array.isArray(rawTopicInterest)) {
      return bad('"topic_interest" must be an array.');
    }
    if (rawTopicInterest.length === 0) {
      return bad('"topic_interest" must have at least one selection.');
    }
    if (rawTopicInterest.length > ALLOWED_TOPIC_INTERESTS.size) {
      return bad('"topic_interest" contains too many values.');
    }

    const topic_interest: string[] = [];
    for (const item of rawTopicInterest) {
      if (typeof item !== 'string') return bad('"topic_interest" items must be strings.');
      const clean = sanitize(item);
      if (!ALLOWED_TOPIC_INTERESTS.has(clean)) {
        return bad(`Invalid "topic_interest" value: "${clean}"`);
      }
      topic_interest.push(clean);
    }
    const topic_interest_deduped = [...new Set(topic_interest)];

    // ── 4. Validate looking_for ────────────────────────────────────────────────

    const rawLookingFor = raw.looking_for;

    if (!Array.isArray(rawLookingFor)) {
      return bad('"looking_for" must be an array.');
    }
    if (rawLookingFor.length === 0) {
      return bad('"looking_for" must have at least one selection.');
    }
    if (rawLookingFor.length > ALLOWED_LOOKING_FOR.size) {
      return bad('"looking_for" contains too many values.');
    }

    const looking_for: string[] = [];
    for (const item of rawLookingFor) {
      if (typeof item !== 'string') return bad('"looking_for" items must be strings.');
      const clean = sanitize(item);
      if (!ALLOWED_LOOKING_FOR.has(clean)) {
        return bad(`Invalid "looking_for" value: "${clean}"`);
      }
      looking_for.push(clean);
    }
    const looking_for_deduped = [...new Set(looking_for)];

    // ── 5. Validate agree_to_share_data ───────────────────────────────────────

    const agree_to_share_data =
      typeof raw.agree_to_share_data === 'boolean'
        ? raw.agree_to_share_data
        : false;

    // ── 6. Build DB record ─────────────────────────────────────────────────────

    const registrationData: CleanRegistration = {
      full_name,
      email,
      phone,
      instagram,
      linkedin_url,
      company,
      company_industry,
      role,
      topic_interest: topic_interest_deduped,
      reason,
      looking_for: looking_for_deduped,
      agree_to_share_data,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    // ── 7. Insert to Supabase ─────────────────────────────────────────────────

    const { error: supabaseError } = await supabase
      .from('talk_n_tales_2_registrations')
      .insert([registrationData])
      .select();

    if (supabaseError) {
      if (supabaseError.code === '23505') {
        return NextResponse.json(
          { success: false, message: 'This email has already been registered.' },
          { status: 409 }
        );
      }
      throw new Error(`Database error: ${supabaseError.message}`);
    }

    // ── 8. Build & send confirmation email ───────────────────────────────────

    const emailHtml = talkNTales2RegistrationConfirmationTemplate({
      name: full_name,
      email,
      eventDate: 'Saturday, 9 May 2026',
      eventTime: '14.00 – 19.30 WIB',
      eventLocation: 'Mantra Space, South Jakarta',
    });

    await transporter.sendMail({
      from: '"PACE ON – Talk N Tales" <hi@paceon.id>',
      to: email,
      subject: "You're Registered — Talk N Tales Vol. 2",
      html: emailHtml,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Registration received! Check your email for confirmation.',
      },
      { status: 200 }
    );

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Registration failed';
    console.error('[TNT2 Register]', msg);

    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}