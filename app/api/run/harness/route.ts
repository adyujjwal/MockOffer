import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  rateLimit,
  isNonEmptyString,
  badRequest,
  unauthorized,
  tooManyRequests,
} from '../../../../lib/apiGuard';
import { runOnWandbox, COMPILER_MAP } from '../../../../lib/codeRunner';

const MODEL = 'gpt-4.1';

// Printed by the generated driver after each example's result so we can split
// combined stdout back into per-case outputs.
const CASE_SEP = '<<<__MOCKOFFER_CASE__>>>';

interface Example {
  input: string;
  output: string;
}

interface HarnessRequest {
  language: string;
  code: string;
  examples: Example[];
}

const norm = (s: string) => s.replace(/\s+/g, '').trim();

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return unauthorized();

    const rl = rateLimit(`run:${userId}`, 15, 60_000);
    if (!rl.ok) return tooManyRequests(rl.retryAfter);

    let body: HarnessRequest;
    try {
      body = (await request.json()) as HarnessRequest;
    } catch {
      return badRequest('Invalid JSON body');
    }
    const { language, code, examples } = body;

    if (!isNonEmptyString(language, 40) || !COMPILER_MAP[language]) {
      return badRequest('unsupported or missing language');
    }
    if (typeof code !== 'string' || code.trim().length === 0 || code.length > 60_000) {
      return badRequest('code must be a non-empty string (max 60000 chars)');
    }
    if (!Array.isArray(examples) || examples.length === 0) {
      return badRequest('examples are required to run against');
    }

    const cases = examples
      .filter((e) => e && typeof e.input === 'string')
      .slice(0, 6)
      .map((e) => ({ input: String(e.input).slice(0, 2000), output: String(e.output ?? '').slice(0, 2000) }));

    if (cases.length === 0) return badRequest('no usable examples');

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });

    // Step 1: assemble a complete runnable program around the user's function.
    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a build tool that assembles a COMPLETE, COMPILABLE ${language} program so a candidate's function can be tested. Return ONLY valid JSON: { "program": string }.

Hard rules:
- Include the candidate's code EXACTLY as given. Do NOT fix, rename, reformat, or "improve" their function, even if it looks buggy. Bugs must surface in the output.
- Add ONLY what is needed to run: imports, a wrapper class if the language requires one, a main/entry point, and per-example calls.
- For EACH example in order: parse the described input into real arguments, call the candidate's function, and print the returned value in a compact, natural form (e.g. arrays as [1,2,3]). Immediately after printing each result, print a line containing EXACTLY: ${CASE_SEP}
- Print nothing else to stdout except the results and the separators.
- ${language === 'java' ? 'Name the public entry class `Main`.' : ''}
- If the candidate's code already defines a main/entry point, still add the per-example driver (rename or route around theirs as needed) so the examples run.
- The program must compile and run standalone. No markdown, no comments explaining your work.`,
          },
          {
            role: 'user',
            content: `Language: ${language}

Candidate's function:
\`\`\`${language}
${code}
\`\`\`

Examples (call the function with the INPUT; OUTPUT is the expected result, shown only so you match its format):
${cases.map((c, i) => `Example ${i + 1}:\n  input: ${c.input}\n  output: ${c.output}`).join('\n')}

Produce the full program.`,
          },
        ],
        max_tokens: 2000,
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error('OpenAI harness error:', aiRes.status, t);
      return NextResponse.json({ error: 'Failed to build the test harness' }, { status: 502 });
    }

    let program = '';
    try {
      const data = await aiRes.json();
      const content = data.choices?.[0]?.message?.content;
      program = JSON.parse(content).program;
    } catch {
      return NextResponse.json({ error: 'Failed to parse harness response' }, { status: 502 });
    }
    if (typeof program !== 'string' || program.trim().length === 0) {
      return NextResponse.json({ error: 'Harness produced no program' }, { status: 502 });
    }

    // Step 2: execute the assembled program for real.
    const run = await runOnWandbox(language, program);
    if (!run.ok) {
      return NextResponse.json({ error: run.error }, { status: run.status });
    }

    // Step 3: split combined stdout back into per-example results.
    const parts = run.data.stdout.split(CASE_SEP).map((p) => p.replace(/^\n+|\n+$/g, ''));
    const results = cases.map((c, i) => {
      const actual = (parts[i] ?? '').trim();
      const expected = c.output.trim();
      return {
        input: c.input,
        expected,
        actual,
        passed: actual.length > 0 && expected.length > 0 && norm(actual) === norm(expected),
      };
    });

    return NextResponse.json({
      language,
      program,
      stdout: run.data.stdout,
      stderr: run.data.stderr,
      compileOutput: run.data.compileOutput,
      code: run.data.code,
      results,
    });
  } catch (error) {
    console.error('Unexpected error in run/harness API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
