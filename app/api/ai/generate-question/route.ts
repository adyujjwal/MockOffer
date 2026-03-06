import { NextRequest, NextResponse } from 'next/server';

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
  languageTemplates?: Record<string, string>;
}

function getDifficultyForExperience(years: number): 'Easy' | 'Medium' | 'Hard' {
  if (years <= 1) return 'Easy';
  if (years <= 5) return 'Medium';
  return 'Hard';
}

function generateMultiLanguageCode(functionName: string, params: string[]): Record<string, string> {
  // Parse parameter to extract name and type
  interface ParsedParam {
    name: string;
    type: string;
  }
  
  const parsedParams: ParsedParam[] = params.map(p => {
    const trimmed = p.trim();
    
    // Handle TypeScript style: "name: type"
    if (trimmed.includes(':')) {
      const [name, type] = trimmed.split(':').map(s => s.trim());
      return { name, type };
    }
    
    // Handle C/Java style: "type name" (e.g., "int[] arr", "String str")
    const words = trimmed.split(/\s+/);
    if (words.length >= 2) {
      const name = words[words.length - 1];
      const type = words.slice(0, -1).join(' ');
      return { name, type };
    }
    
    // Plain name only
    return { name: trimmed, type: 'any' };
  });
  
  // Convert type for each language
  const mapType = (type: string, lang: 'java' | 'cpp' | 'csharp' | 'typescript'): string => {
    const normalized = type.toLowerCase().replace(/\s+/g, '');
    
    // Array types
    if (normalized.includes('[]') || normalized.includes('array')) {
      if (normalized.includes('int') || normalized.includes('number')) {
        return { java: 'int[]', cpp: 'vector<int>&', csharp: 'int[]', typescript: 'number[]' }[lang];
      }
      if (normalized.includes('string')) {
        return { java: 'String[]', cpp: 'vector<string>&', csharp: 'string[]', typescript: 'string[]' }[lang];
      }
      return { java: 'int[]', cpp: 'vector<int>&', csharp: 'int[]', typescript: 'any[]' }[lang];
    }
    
    // String types
    if (normalized.includes('string')) {
      return { java: 'String', cpp: 'string', csharp: 'string', typescript: 'string' }[lang];
    }
    
    // Number/int types
    if (normalized.includes('int') || normalized.includes('number')) {
      return { java: 'int', cpp: 'int', csharp: 'int', typescript: 'number' }[lang];
    }
    
    // Default
    return { java: 'Object', cpp: 'auto', csharp: 'object', typescript: 'any' }[lang];
  };
  
  const jsParams = parsedParams.map(p => p.name).join(', ');
  const tsParams = parsedParams.map(p => `${p.name}: ${mapType(p.type, 'typescript')}`).join(', ');
  const pythonParams = parsedParams.map(p => p.name.replace(/([A-Z])/g, '_$1').toLowerCase()).join(', ');
  const javaParams = parsedParams.map(p => `${mapType(p.type, 'java')} ${p.name}`).join(', ');
  const cppParams = parsedParams.map(p => `${mapType(p.type, 'cpp')} ${p.name}`).join(', ');
  const csharpParams = parsedParams.map(p => `${mapType(p.type, 'csharp')} ${p.name}`).join(', ');
  const goParams = parsedParams.map(p => `${p.name} interface{}`).join(', ');
  const rustParams = parsedParams.map(p => `${p.name}: &[i32]`).join(', ');
  
  return {
    javascript: `function ${functionName}(${jsParams}) {\n    // Write your solution here\n    \n}`,
    typescript: `function ${functionName}(${tsParams}): any {\n    // Write your solution here\n    \n}`,
    python: `def ${functionName}(${pythonParams}):\n    # Write your solution here\n    pass`,
    java: `class Solution {\n    public void ${functionName}(${javaParams}) {\n        // Write your solution here\n    }\n}`,
    cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nvoid ${functionName}(${cppParams}) {\n    // Write your solution here\n}`,
    csharp: `using System;\n\npublic class Solution {\n    public void ${functionName}(${csharpParams}) {\n        // Write your solution here\n    }\n}`,
    go: `package main\n\nfunc ${functionName}(${goParams}) {\n    // Write your solution here\n}`,
    rust: `fn ${functionName}(${rustParams}) {\n    // Write your solution here\n}`
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: QuestionRequest = await request.json();
    const { company, role, experienceLevel } = body;

    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('No OpenAI API key found');
      return NextResponse.json({ 
        error: 'OpenAI API key not configured',
        details: 'Please add OPENAI_API_KEY to environment variables' 
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
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Return ONLY valid JSON.

Schema:
{
  "title": string,
  "description": string,
  "examples": [
    {
      "input": string,
      "output": string,
      "explanation": string
    }
  ],
  "constraints": string[],
  "difficulty": "Easy" | "Medium" | "Hard",
  "functionName": string,
  "parameters": string[]
}

Rules:
- examples MUST contain exactly 3 examples
- each example MUST include input, output, explanation
- use concrete numbers or arrays in examples
- do not leave examples empty
- constraints can be empty [] if not relevant
- avoid: Two Sum, FizzBuzz, Palindrome, Reverse String`
          },
          {
            role: 'user',
            content: `Generate a unique coding interview question that ${company} typically asks ${role} candidates with ${experienceLevel} years of experience.

Base this on real ${company} interview patterns (LeetCode, Glassdoor, interviewing.io).

Requirements:
- Appropriate difficulty for ${experienceLevel} years experience
- Match ${company}'s interview style
- Include 3 concrete examples
- Provide descriptive function name and parameters`
          }
        ],
        max_tokens: 2000,
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return NextResponse.json({ 
        error: 'Failed to generate question',
        details: `OpenAI API returned ${response.status}: ${response.statusText}` 
      }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('No content in OpenAI response:', data);
      return NextResponse.json({ 
        error: 'Empty response from OpenAI',
        details: 'No content returned from OpenAI API' 
      }, { status: 500 });
    }

    // JSON mode guarantees valid JSON - parse directly
    try {
      const parsed = JSON.parse(content);
      
      // Validate required fields
      if (!parsed.title || !parsed.description) {
        console.error('Missing required fields in OpenAI response:', parsed);
        return NextResponse.json({ 
          error: 'Incomplete question data',
          details: 'Generated question missing title or description' 
        }, { status: 500 });
      }

      // Ensure examples is always an array with proper structure
      let examples = parsed.examples;
      
      if (!Array.isArray(examples) || examples.length === 0) {
        // Generate reasonable defaults based on the problem
        examples = [
          { 
            input: 'nums = [1,2,3,4,5]',
            output: '5',
            explanation: 'The maximum element in the array is 5'
          },
          {
            input: 'nums = [-1,-2,-3]',
            output: '-1',
            explanation: 'When all elements are negative, return the largest (least negative)'
          }
        ];
      } else {
        // Validate each example has required fields
        examples = examples.map((ex: any, idx: number) => ({
          input: ex.input || `Example ${idx + 1} input`,
          output: ex.output || `Example ${idx + 1} output`,
          explanation: ex.explanation || 'Work through this example step by step'
        }));
      }

      // Constraints are optional - only include if provided
      let constraints = parsed.constraints;
      
      if (!Array.isArray(constraints)) {
        constraints = [];
      }
      
      // Extract function name and parameters for multi-language templates
      const functionName = parsed.functionName || 'solution';
      const parameters = Array.isArray(parsed.parameters) && parsed.parameters.length > 0 
        ? parsed.parameters 
        : ['input'];
      
      // Generate templates for all languages
      const languageTemplates = generateMultiLanguageCode(functionName, parameters);

      const generatedQuestion: GeneratedProblem = {
        id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: parsed.title,
        description: parsed.description,
        examples,
        constraints,
        difficulty: parsed.difficulty || difficulty,
        defaultCode: languageTemplates.javascript,
        languageTemplates
      };
      
      return NextResponse.json(generatedQuestion);
      
    } catch (parseError) {
      console.error('Failed to parse OpenAI JSON response:', parseError);
      return NextResponse.json({ 
        error: 'Failed to parse AI response',
        details: `JSON parsing failed: ${parseError instanceof Error ? parseError.message : 'Unknown error'}` 
      }, { status: 500 });
    }
      
  } catch (error) {
    console.error('Unexpected error in generate-question API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: 'An unexpected error occurred while generating the question' 
    }, { status: 500 });
  }
}