import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  rateLimit,
  isNonEmptyString,
  badRequest,
  unauthorized,
  tooManyRequests,
} from '../../../lib/apiGuard';
import { runOnWandbox } from '../../../lib/codeRunner';

interface RunRequest {
  language: string;
  code: string;
  stdin?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return unauthorized();

    // External engine: keep this conservative.
    const rl = rateLimit(`run:${userId}`, 15, 60_000);
    if (!rl.ok) return tooManyRequests(rl.retryAfter);

    let body: RunRequest;
    try {
      body = (await request.json()) as RunRequest;
    } catch {
      return badRequest('Invalid JSON body');
    }
    const { language, code, stdin } = body;

    if (!isNonEmptyString(language, 40)) return badRequest('language is required');
    if (typeof code !== 'string' || code.trim().length === 0 || code.length > 60_000) {
      return badRequest('code must be a non-empty string (max 60000 chars)');
    }
    if (stdin !== undefined && (typeof stdin !== 'string' || stdin.length > 20_000)) {
      return badRequest('stdin must be a string (max 20000 chars)');
    }

    const result = await runOnWandbox(language, code, stdin ?? '');
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ ...result.data, language });
  } catch (error) {
    console.error('Unexpected error in run API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
