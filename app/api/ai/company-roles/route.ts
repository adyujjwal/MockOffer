import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  rateLimit,
  isNonEmptyString,
  badRequest,
  unauthorized,
  tooManyRequests,
} from '../../../../lib/apiGuard';

const MODEL = 'gpt-4.1';

interface CompanyRolesRequest {
  company: string;
}

interface CompanyRolesResponse {
  valid: boolean;
  canonicalName: string;
  roles: string[];
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication: only signed-in users may spend AI credits.
    const { userId } = await auth();
    if (!userId) return unauthorized();

    // 2. Rate limit per user (30 lookups / minute).
    const rl = rateLimit(`company-roles:${userId}`, 30, 60_000);
    if (!rl.ok) return tooManyRequests(rl.retryAfter);

    // 3. Parse and validate input.
    let body: CompanyRolesRequest;
    try {
      body = (await request.json()) as CompanyRolesRequest;
    } catch {
      return badRequest('Invalid JSON body');
    }
    const { company } = body;
    if (!isNonEmptyString(company, 100)) return badRequest('company is required (max 100 chars)');

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('No OpenAI API key found');
      return NextResponse.json({
        error: 'OpenAI API key not configured',
        details: 'Please add OPENAI_API_KEY to environment variables',
      }, { status: 500 });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `You validate company names for a coding-interview practice app. Return ONLY valid JSON.

Schema:
{
  "valid": boolean,
  "canonicalName": string,
  "roles": string[],
  "message": string
}

Rules:
- "valid" is true only if the input clearly refers to a real, known company (correct spelling tolerated; e.g. "gogle" -> "Google").
- "canonicalName" is the correctly-cased official company name (e.g. "Google", "Stripe", "JPMorgan Chase"). If invalid, echo the raw input.
- "roles" lists 6 to 10 engineering / technical roles that THIS company actually hires and interviews for, ordered from most common to most senior. Tailor to the company (e.g. a bank includes "Quantitative Developer"; a search company includes "Search Infrastructure Engineer"). If invalid, return [].
- "message": if invalid, a short friendly note like "We couldn't recognize that company. Check the spelling or try another."; if valid, "".
- Do NOT wrap JSON in markdown fences.`,
          },
          {
            role: 'user',
            content: `Company input: "${company.trim()}"`,
          },
        ],
        max_tokens: 500,
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return NextResponse.json({
        error: 'Failed to validate company',
        details: `OpenAI API returned ${response.status}: ${response.statusText}`,
      }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({
        error: 'Empty response from OpenAI',
        details: 'No content returned from OpenAI API',
      }, { status: 500 });
    }

    try {
      const parsed = JSON.parse(content);
      const result: CompanyRolesResponse = {
        valid: Boolean(parsed.valid),
        canonicalName:
          typeof parsed.canonicalName === 'string' && parsed.canonicalName.trim()
            ? parsed.canonicalName.trim()
            : company.trim(),
        roles: Array.isArray(parsed.roles)
          ? parsed.roles.filter((r: unknown): r is string => typeof r === 'string' && r.trim().length > 0).slice(0, 12)
          : [],
        message: typeof parsed.message === 'string' ? parsed.message : '',
      };
      // Guard: a "valid" company with no roles is not useful downstream.
      if (result.valid && result.roles.length === 0) {
        result.roles = [
          'Software Engineer',
          'Senior Software Engineer',
          'Frontend Engineer',
          'Backend Engineer',
          'Full Stack Engineer',
          'Machine Learning Engineer',
        ];
      }
      return NextResponse.json(result);
    } catch (parseError) {
      console.error('Failed to parse OpenAI JSON response:', parseError);
      return NextResponse.json({
        error: 'Failed to parse AI response',
        details: `JSON parsing failed: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Unexpected error in company-roles API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: 'An unexpected error occurred while validating the company',
    }, { status: 500 });
  }
}
