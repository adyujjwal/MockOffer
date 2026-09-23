// Shared code-execution helper backed by Wandbox (free, keyless, real
// execution). Used by the raw run route and the example-harness route.

const WANDBOX_URL = 'https://wandbox.org/api/compile.json';

// Pinned, verified Wandbox compilers for each editor language.
export const COMPILER_MAP: Record<string, string> = {
  javascript: 'nodejs-20.17.0',
  typescript: 'typescript-5.6.2',
  python: 'cpython-3.12.7',
  java: 'openjdk-jdk-22+36',
  cpp: 'gcc-13.2.0',
  csharp: 'mono-6.12.0.199',
  go: 'go-1.23.2',
  rust: 'rust-1.82.0',
};

// Wandbox writes the main source to `prog.java`, so javac rejects a `public`
// top-level class whose name differs from the file. Dropping the modifier
// keeps the class usable without changing behaviour.
export function prepareSource(language: string, code: string): string {
  if (language === 'java') {
    return code.replace(/\bpublic\s+(?=(?:final\s+|abstract\s+)*class\b)/g, '');
  }
  return code;
}

export interface RunOutcome {
  stdout: string;
  stderr: string;
  code: number | null;
  signal: string | null;
  compileOutput: string;
  version: string;
}

export type RunResult =
  | { ok: true; data: RunOutcome }
  | { ok: false; status: number; error: string };

export async function runOnWandbox(
  language: string,
  code: string,
  stdin = '',
): Promise<RunResult> {
  const compiler = COMPILER_MAP[language];
  if (!compiler) return { ok: false, status: 400, error: `Unsupported language: ${language}` };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);

  let res: Response;
  try {
    res = await fetch(WANDBOX_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        compiler,
        code: prepareSource(language, code),
        stdin,
        save: false,
      }),
    });
  } catch (e) {
    clearTimeout(timeout);
    if (e instanceof Error && e.name === 'AbortError') {
      return { ok: false, status: 504, error: 'Execution timed out. Please try again.' };
    }
    return { ok: false, status: 502, error: 'Could not reach the execution service.' };
  }
  clearTimeout(timeout);

  if (!res.ok) {
    const text = await res.text();
    console.error('Wandbox error:', res.status, text);
    return { ok: false, status: 502, error: 'Execution service returned an error.' };
  }

  const data = await res.json();
  const statusNum = Number.parseInt(data.status, 10);

  return {
    ok: true,
    data: {
      stdout: data.program_output ?? '',
      stderr: data.program_error ?? '',
      code: Number.isFinite(statusNum) ? statusNum : null,
      signal: data.signal || null,
      compileOutput: (data.compiler_error || '').trim(),
      version: compiler,
    },
  };
}
