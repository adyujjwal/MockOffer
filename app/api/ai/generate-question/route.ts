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

// Model used for question generation. gpt-4.1 gives far more accurate function
// signatures and better recall of real, on-pattern interview questions.
const MODEL = 'gpt-4.1';

const LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'csharp',
  'go',
  'rust',
] as const;
type Lang = (typeof LANGUAGES)[number];

interface QuestionRequest {
  company: string;
  role: string;
  experienceLevel: number;
}

interface GeneratedProblem {
  id: string;
  title: string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  defaultCode: string;
  languageTemplates: Record<string, string>;
}

function getDifficultyForExperience(years: number): 'Easy' | 'Medium' | 'Hard' {
  if (years <= 1) return 'Easy';
  if (years <= 5) return 'Medium';
  return 'Hard';
}

/**
 * Fallback starter-code generator. Only used when the model does not return a
 * usable `starterCode` block. It now honours the problem's return type so the
 * generated signatures stay in parity with the described function.
 */
function generateMultiLanguageCode(
  functionName: string,
  params: string[],
  returnType: string,
): Record<string, string> {
  interface ParsedParam {
    name: string;
    type: string;
  }

  const parsedParams: ParsedParam[] = params.map((p) => {
    const trimmed = p.trim();
    if (trimmed.includes(':')) {
      const [name, type] = trimmed.split(':').map((s) => s.trim());
      return { name, type };
    }
    const words = trimmed.split(/\s+/);
    if (words.length >= 2) {
      const name = words[words.length - 1];
      const type = words.slice(0, -1).join(' ');
      return { name, type };
    }
    return { name: trimmed, type: 'any' };
  });

  const mapType = (type: string, lang: 'java' | 'cpp' | 'csharp' | 'typescript' | 'go' | 'rust'): string => {
    const normalized = (type || '').toLowerCase().replace(/\s+/g, '');
    if (normalized.includes('void') || normalized === '') {
      return { java: 'void', cpp: 'void', csharp: 'void', typescript: 'void', go: '', rust: '()' }[lang];
    }
    if (normalized.includes('bool')) {
      return { java: 'boolean', cpp: 'bool', csharp: 'bool', typescript: 'boolean', go: 'bool', rust: 'bool' }[lang];
    }
    if (normalized.includes('[]') || normalized.includes('array') || normalized.includes('list') || normalized.includes('vector')) {
      if (normalized.includes('string')) {
        return { java: 'String[]', cpp: 'vector<string>', csharp: 'string[]', typescript: 'string[]', go: '[]string', rust: 'Vec<String>' }[lang];
      }
      return { java: 'int[]', cpp: 'vector<int>', csharp: 'int[]', typescript: 'number[]', go: '[]int', rust: 'Vec<i32>' }[lang];
    }
    if (normalized.includes('string')) {
      return { java: 'String', cpp: 'string', csharp: 'string', typescript: 'string', go: 'string', rust: 'String' }[lang];
    }
    if (normalized.includes('double') || normalized.includes('float')) {
      return { java: 'double', cpp: 'double', csharp: 'double', typescript: 'number', go: 'float64', rust: 'f64' }[lang];
    }
    if (normalized.includes('int') || normalized.includes('number') || normalized.includes('long')) {
      return { java: 'int', cpp: 'int', csharp: 'int', typescript: 'number', go: 'int', rust: 'i32' }[lang];
    }
    return { java: 'Object', cpp: 'auto', csharp: 'object', typescript: 'any', go: 'interface{}', rust: 'i32' }[lang];
  };

  // Sensible default return statement so the stub compiles / runs.
  const defaultReturn = (type: string, lang: 'java' | 'cpp' | 'csharp' | 'go' | 'rust'): string => {
    const normalized = (type || '').toLowerCase().replace(/\s+/g, '');
    if (normalized.includes('void') || normalized === '') return '';
    if (normalized.includes('bool')) {
      return { java: 'return false;', cpp: 'return false;', csharp: 'return false;', go: 'return false', rust: 'false' }[lang];
    }
    if (normalized.includes('[]') || normalized.includes('array') || normalized.includes('list') || normalized.includes('vector')) {
      const isStr = normalized.includes('string');
      return {
        java: isStr ? 'return new String[0];' : 'return new int[0];',
        cpp: 'return {};',
        csharp: isStr ? 'return new string[0];' : 'return new int[0];',
        go: isStr ? 'return nil' : 'return nil',
        rust: 'Vec::new()',
      }[lang];
    }
    if (normalized.includes('string')) {
      return { java: 'return "";', cpp: 'return "";', csharp: 'return "";', go: 'return ""', rust: 'String::new()' }[lang];
    }
    if (normalized.includes('double') || normalized.includes('float')) {
      return { java: 'return 0.0;', cpp: 'return 0.0;', csharp: 'return 0.0;', go: 'return 0', rust: '0.0' }[lang];
    }
    return { java: 'return 0;', cpp: 'return 0;', csharp: 'return 0;', go: 'return 0', rust: '0' }[lang];
  };

  const jsParams = parsedParams.map((p) => p.name).join(', ');
  const tsParams = parsedParams.map((p) => `${p.name}: ${mapType(p.type, 'typescript')}`).join(', ');
  const pythonParams = parsedParams.map((p) => p.name.replace(/([A-Z])/g, '_$1').toLowerCase()).join(', ');
  const javaParams = parsedParams.map((p) => `${mapType(p.type, 'java')} ${p.name}`).join(', ');
  const cppParams = parsedParams.map((p) => `${mapType(p.type, 'cpp')} ${p.name}`).join(', ');
  const csharpParams = parsedParams.map((p) => `${mapType(p.type, 'csharp')} ${p.name}`).join(', ');
  const goParams = parsedParams.map((p) => `${p.name} ${mapType(p.type, 'go')}`).join(', ');
  const rustParams = parsedParams.map((p) => `${p.name}: ${mapType(p.type, 'rust')}`).join(', ');

  const tsRet = mapType(returnType, 'typescript');
  const javaRet = mapType(returnType, 'java');
  const cppRet = mapType(returnType, 'cpp');
  const csharpRet = mapType(returnType, 'csharp');
  const goRet = mapType(returnType, 'go');
  const rustRet = mapType(returnType, 'rust');

  const javaBody = defaultReturn(returnType, 'java');
  const cppBody = defaultReturn(returnType, 'cpp');
  const csharpBody = defaultReturn(returnType, 'csharp');
  const goBody = defaultReturn(returnType, 'go');
  const rustBody = defaultReturn(returnType, 'rust');

  return {
    javascript: `function ${functionName}(${jsParams}) {\n    // Write your solution here\n    \n}`,
    typescript: `function ${functionName}(${tsParams}): ${tsRet} {\n    // Write your solution here\n    \n}`,
    python: `def ${functionName}(${pythonParams}):\n    # Write your solution here\n    pass`,
    java: `class Solution {\n    public ${javaRet} ${functionName}(${javaParams}) {\n        // Write your solution here\n        ${javaBody}\n    }\n}`,
    cpp: `#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\n${cppRet} ${functionName}(${cppParams}) {\n    // Write your solution here\n    ${cppBody}\n}`,
    csharp: `using System;\n\npublic class Solution {\n    public ${csharpRet} ${functionName}(${csharpParams}) {\n        // Write your solution here\n        ${csharpBody}\n    }\n}`,
    go: `package main\n\nfunc ${functionName}(${goParams}) ${goRet} {\n    // Write your solution here\n    ${goBody}\n}`,
    rust: `fn ${functionName}(${rustParams}) -> ${rustRet} {\n    // Write your solution here\n    ${rustBody}\n}`,
  };
}

/** Keep only known language keys and drop empty/non-string entries. */
function normalizeStarterCode(raw: unknown): Record<string, string> | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const lang of LANGUAGES) {
    const val = obj[lang];
    if (typeof val === 'string' && val.trim().length > 0) {
      out[lang] = val;
    }
  }
  // Require at least the core languages so we don't ship a half-empty editor.
  return out.javascript && out.python ? out : null;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication: only signed-in users may spend AI credits.
    const { userId } = await auth();
    if (!userId) return unauthorized();

    // 2. Rate limit per user (20 questions / minute).
    const rl = rateLimit(`generate-question:${userId}`, 20, 60_000);
    if (!rl.ok) return tooManyRequests(rl.retryAfter);

    // 3. Parse and validate input.
    let body: QuestionRequest;
    try {
      body = (await request.json()) as QuestionRequest;
    } catch {
      return badRequest('Invalid JSON body');
    }
    const { company, role, experienceLevel } = body;

    if (!isNonEmptyString(company, 100)) return badRequest('company is required (max 100 chars)');
    if (!isNonEmptyString(role, 100)) return badRequest('role is required (max 100 chars)');
    if (!isFiniteNumberInRange(experienceLevel, 0, 50)) {
      return badRequest('experienceLevel must be a number between 0 and 50');
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error('No OpenAI API key found');
      return NextResponse.json({
        error: 'OpenAI API key not configured',
        details: 'Please add OPENAI_API_KEY to environment variables',
      }, { status: 500 });
    }

    const difficulty = getDifficultyForExperience(experienceLevel);

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
            content: `You are a senior technical interviewer. Return ONLY valid JSON.

Schema:
{
  "title": string,
  "description": string,
  "examples": [
    { "input": string, "output": string, "explanation": string }
  ],
  "constraints": string[],
  "difficulty": "Easy" | "Medium" | "Hard",
  "functionName": string,
  "parameters": [ { "name": string, "type": string } ],
  "returnType": string,
  "starterCode": {
    "javascript": string,
    "typescript": string,
    "python": string,
    "java": string,
    "cpp": string,
    "csharp": string,
    "go": string,
    "rust": string
  }
}

Rules:
- examples MUST contain exactly 3 examples, each with concrete input, output and explanation.
- constraints can be [] if not relevant.
- functionName is descriptive camelCase; parameters and returnType describe the required signature.
- starterCode MUST provide an idiomatic, compilable function stub for EVERY language.
- Every stub's signature (name, parameter names/types, and return type) MUST match functionName, parameters and returnType exactly, so the editor stays in parity with the problem.
- Each stub body contains only a "Write your solution here" comment and, where the language requires it, a placeholder return.
- Do NOT wrap JSON in markdown fences. Avoid overused toy problems: Two Sum, FizzBuzz, Palindrome, Reverse String.`,
          },
          {
            role: 'user',
            content: `Generate a realistic coding interview question that ${company} actually asks ${role} candidates with ${experienceLevel} years of experience.

Ground the question in genuine, recently-reported interview experiences for ${company} (e.g. LeetCode Discuss, Glassdoor, Blind, interviewing.io) rather than generic textbook problems. Match ${company}'s real interview style and the expected difficulty for ${experienceLevel} years of experience (target difficulty: ${difficulty}).

Provide a descriptive function name, typed parameters, a return type, and compilable starter code for all languages whose signatures match that function exactly.`,
          },
        ],
        max_tokens: 3000,
        temperature: 0.4,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return NextResponse.json({
        error: 'Failed to generate question',
        details: `OpenAI API returned ${response.status}: ${response.statusText}`,
      }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in OpenAI response:', data);
      return NextResponse.json({
        error: 'Empty response from OpenAI',
        details: 'No content returned from OpenAI API',
      }, { status: 500 });
    }

    try {
      const parsed = JSON.parse(content);

      if (!parsed.title || !parsed.description) {
        console.error('Missing required fields in OpenAI response:', parsed);
        return NextResponse.json({
          error: 'Incomplete question data',
          details: 'Generated question missing title or description',
        }, { status: 500 });
      }

      // Examples: keep the model's, else provide reasonable defaults.
      let examples = parsed.examples;
      if (!Array.isArray(examples) || examples.length === 0) {
        examples = [
          { input: 'nums = [1,2,3,4,5]', output: '5', explanation: 'The maximum element in the array is 5' },
          { input: 'nums = [-1,-2,-3]', output: '-1', explanation: 'When all elements are negative, return the largest (least negative)' },
        ];
      } else {
        examples = examples.map((ex: any, idx: number) => ({
          input: ex.input || `Example ${idx + 1} input`,
          output: ex.output || `Example ${idx + 1} output`,
          explanation: ex.explanation || 'Work through this example step by step',
        }));
      }

      let constraints = parsed.constraints;
      if (!Array.isArray(constraints)) constraints = [];

      // Signature parity: prefer the model's per-language starter code (its
      // signatures match the described function). Fall back to the local
      // generator only when the model omits usable stubs.
      const functionName = parsed.functionName || 'solution';
      const parameterList: string[] = Array.isArray(parsed.parameters) && parsed.parameters.length > 0
        ? parsed.parameters.map((p: any) =>
            typeof p === 'string' ? p : `${p?.name ?? 'input'}: ${p?.type ?? 'any'}`,
          )
        : ['input: any'];
      const returnType: string = typeof parsed.returnType === 'string' ? parsed.returnType : 'any';

      const languageTemplates =
        normalizeStarterCode(parsed.starterCode) ??
        generateMultiLanguageCode(functionName, parameterList, returnType);

      const generatedQuestion: GeneratedProblem = {
        id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: parsed.title,
        description: parsed.description,
        examples,
        constraints,
        difficulty: parsed.difficulty || difficulty,
        defaultCode: languageTemplates.javascript || languageTemplates[Object.keys(languageTemplates)[0]],
        languageTemplates,
      };

      return NextResponse.json(generatedQuestion);
    } catch (parseError) {
      console.error('Failed to parse OpenAI JSON response:', parseError);
      return NextResponse.json({
        error: 'Failed to parse AI response',
        details: `JSON parsing failed: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Unexpected error in generate-question API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: 'An unexpected error occurred while generating the question',
    }, { status: 500 });
  }
}
