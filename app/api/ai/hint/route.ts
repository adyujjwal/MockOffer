import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  rateLimit,
  isNonEmptyString,
  isFiniteNumberInRange,
  badRequest,
  unauthorized,
  tooManyRequests,
} from '../../../../lib/apiGuard';

const MODEL = 'gpt-4.1';

interface HintRequest {
  problem: string;
  code: string;
  language: string;
  level: number; // 1, 2, or 3
}

// What each progressive hint level is allowed to reveal.
const LEVEL_GUIDE: Record<number, string> = {
  1: 'A high-level nudge about how to think about the problem or what category it falls into. Do NOT mention specific data structures or algorithms yet.',
  2: 'Point to the key data structure or algorithmic technique that unlocks an efficient solution, and why. Still do NOT write the solution.',
  3: 'Describe the step-by-step approach and the target time/space complexity in plain English. Still do NOT write full working code, only at most a tiny pseudocode fragment if essential.',
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return unauthorized();

    const rl = rateLimit(`hint:${userId}`, 40, 60_000);
    if (!rl.ok) return tooManyRequests(rl.retryAfter);

    let body: HintRequest;
    try {
      body = (await request.json()) as HintRequest;
    } catch {
      return badRequest('Invalid JSON body');
    }
    const { problem, code, language, level } = body;

    if (!isNonEmptyString(problem, 20_000)) return badRequest('problem is required (max 20000 chars)');
    if (typeof code !== 'string' || code.length > 60_000) return badRequest('code must be a string (max 60000 chars)');
    if (!isNonEmptyString(language, 40)) return badRequest('language is required (max 40 chars)');
    if (!isFiniteNumberInRange(level, 1, 3)) return badRequest('level must be 1, 2, or 3');

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const levelGuide = LEVEL_GUIDE[Math.round(level)] ?? LEVEL_GUIDE[1];

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
            content: `You are a supportive coding interviewer giving a candidate a HINT. Return ONLY valid JSON: { "hint": string }.

This is progressive hint level ${level} of 3. ${levelGuide}

Rules:
- Never reveal a full working solution or copy-pasteable code.
- Keep the hint to 1-3 short sentences.
- Be encouraging and specific to THIS problem.
- Consider the candidate's current code (if any) and gently address where they seem stuck, without solving it for them.`,
          },
          {
            role: 'user',
            content: `Problem:\n${problem}\n\nCandidate's current ${language} code:\n${code || '(empty)'}\n\nGive hint level ${level}.`,
          },
        ],
        max_tokens: 300,
        temperature: 0.5,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return NextResponse.json({ error: 'Failed to generate hint' }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'Empty response from OpenAI' }, { status: 500 });
    }

    try {
      const parsed = JSON.parse(content);
      const hint = typeof parsed.hint === 'string' && parsed.hint.trim()
        ? parsed.hint.trim()
        : 'Think about what work you are repeating and whether a different data structure could avoid it.';
      return NextResponse.json({ hint, level });
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }
  } catch (error) {
    console.error('Unexpected error in hint API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
