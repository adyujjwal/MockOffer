import { NextRequest, NextResponse } from 'next/server';

interface FeedbackRequest {
  code: string;
  problem: string;
  language: string;
}

interface FeedbackResponse {
  timeComplexity: string;
  spaceComplexity: string;
  correctness: {
    isCorrect: boolean;
    issues: string[];
  };
  optimization: {
    suggestions: string[];
    optimizedCode?: string;
  };
  codeQuality: {
    score: number;
    improvements: string[];
  };
  edgeCases: string[];
}

function getFallbackFeedback(): FeedbackResponse {
  return {
    timeComplexity: 'Unable to analyze - AI service unavailable',
    spaceComplexity: 'Unable to analyze - AI service unavailable',
    correctness: {
      isCorrect: true,
      issues: ['Please configure AI service for detailed analysis']
    },
    optimization: {
      suggestions: ['Configure OpenAI API key for optimization suggestions']
    },
    codeQuality: {
      score: 7,
      improvements: ['AI service needed for code quality analysis']
    },
    edgeCases: ['Configure AI service to get edge case analysis']
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackRequest = await request.json();
    const { code, problem, language } = body;

    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(getFallbackFeedback());
    }

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
            content: `You are a strict coding interview evaluator.

Return ONLY valid JSON.

Schema:
{
  "timeComplexity": string,
  "spaceComplexity": string,
  "correctness": {
    "isCorrect": boolean,
    "issues": string[]
  },
  "optimization": {
    "suggestions": string[],
    "optimizedCode": string
  },
  "codeQuality": {
    "score": number,
    "improvements": string[]
  },
  "edgeCases": string[]
}

Rules:
- Be strict like a FAANG interviewer
- If the solution has flaws, mark correctness false
- Always provide at least 2 optimization suggestions
- Always give a codeQuality score between 1-10
- edgeCases should list important edge cases to test
- optimization.optimizedCode should be in the same language as the input code`
          },
          {
            role: 'user',
            content: `Problem:
${problem}

Language:
${language}

Code:
${code}

Evaluate the solution strictly.`
          }
        ],
        max_tokens: 2000,
        temperature: 0.2,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error for feedback:', response.status, errorText);
      return NextResponse.json(getFallbackFeedback());
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('No content in OpenAI feedback response');
      return NextResponse.json(getFallbackFeedback());
    }

    // JSON mode guarantees valid JSON - parse directly
    try {
      const feedback = JSON.parse(content) as FeedbackResponse;
      
      // Validate required fields
      if (!feedback.timeComplexity || !feedback.spaceComplexity) {
        console.error('Missing required complexity fields in feedback');
        return NextResponse.json(getFallbackFeedback());
      }
      
      // Ensure all arrays exist
      const validatedFeedback: FeedbackResponse = {
        timeComplexity: feedback.timeComplexity,
        spaceComplexity: feedback.spaceComplexity,
        correctness: {
          isCorrect: feedback.correctness?.isCorrect ?? true,
          issues: Array.isArray(feedback.correctness?.issues) ? feedback.correctness.issues : []
        },
        optimization: {
          suggestions: Array.isArray(feedback.optimization?.suggestions) ? feedback.optimization.suggestions : [],
          optimizedCode: feedback.optimization?.optimizedCode
        },
        codeQuality: {
          score: typeof feedback.codeQuality?.score === 'number' ? feedback.codeQuality.score : 7,
          improvements: Array.isArray(feedback.codeQuality?.improvements) ? feedback.codeQuality.improvements : []
        },
        edgeCases: Array.isArray(feedback.edgeCases) ? feedback.edgeCases : []
      };
      
      return NextResponse.json(validatedFeedback);
      
    } catch (parseError) {
      console.error('Failed to parse OpenAI feedback JSON:', parseError);
      return NextResponse.json(getFallbackFeedback());
    }
    
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json(getFallbackFeedback());
  }
}