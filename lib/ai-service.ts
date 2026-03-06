// AI Service for generating feedback on coding solutions

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

interface ProblemGenerationRequest {
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
}

export class AIService {
  private apiKey: string;
  private useGemini: boolean;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || '';
    this.useGemini = !!process.env.GOOGLE_GEMINI_API_KEY && !process.env.OPENAI_API_KEY;
  }

  async generateInterviewQuestion(
    request: ProblemGenerationRequest,
    onProgress?: (message: string) => void
  ): Promise<GeneratedProblem> {
    const prompt = this.createQuestionPrompt(request);

    try {
      onProgress?.('Generating interview question...');
      
      if (this.useGemini) {
        onProgress?.('Creating question with Gemini AI...');
        return await this.callGeminiForQuestion(prompt, request);
      } else {
        onProgress?.('Creating question with OpenAI...');
        return await this.callOpenAIForQuestion(prompt, request);
      }
    } catch (error) {
      console.error('Question Generation Error:', error);
      onProgress?.('Using fallback question...');
      return this.getFallbackQuestion(request);
    }
  }

  async generateFeedback(
    request: FeedbackRequest, 
    onProgress?: (message: string) => void
  ): Promise<FeedbackResponse> {
    const prompt = this.createPrompt(request);

    try {
      onProgress?.('Connecting to AI service...');
      
      if (this.useGemini) {
        onProgress?.('Analyzing with Gemini AI...');
        return await this.callGeminiAPI(prompt);
      } else {
        onProgress?.('Analyzing with OpenAI...');
        return await this.callOpenAIAPI(prompt);
      }
    } catch (error) {
      console.error('AI Service Error:', error);
      onProgress?.('AI service temporarily unavailable...');
      return this.getFallbackFeedback();
    }
  }

  private createPrompt(request: FeedbackRequest): string {
    return `
Analyze the following coding solution and provide structured feedback:

**Problem:**
${request.problem}

**Code (${request.language}):**
\`\`\`${request.language}
${request.code}
\`\`\`

Please provide detailed feedback in the following format:

1. **Time Complexity:** Analyze and state the Big O time complexity
2. **Space Complexity:** Analyze and state the Big O space complexity
3. **Correctness:** Is the solution correct? List any issues if found
4. **Optimization:** Suggest improvements and provide optimized code if possible
5. **Code Quality:** Rate the code quality (1-10) and suggest improvements
6. **Edge Cases:** List edge cases that should be considered

Be constructive and educational in your feedback. Focus on helping the developer improve.
    `;
  }

  private async callOpenAIAPI(prompt: string): Promise<FeedbackResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert coding interview evaluator. Provide detailed, constructive feedback on coding solutions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    return this.parseFeedbackResponse(data.choices[0].message.content);
  }

  private async callGeminiAPI(prompt: string): Promise<FeedbackResponse> {
    // Note: This is a simplified Gemini API call
    // In a real implementation, you'd use the official Gemini SDK
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }),
    });

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return this.parseFeedbackResponse(content);
  }

  private parseFeedbackResponse(content: string): FeedbackResponse {
    // This is a simplified parser. In a real implementation,
    // you'd use more sophisticated parsing or ask the AI to return JSON
    
    return {
      timeComplexity: this.extractSection(content, 'Time Complexity') || 'Not analyzed',
      spaceComplexity: this.extractSection(content, 'Space Complexity') || 'Not analyzed',
      correctness: {
        isCorrect: !content.toLowerCase().includes('incorrect'),
        issues: this.extractListItems(content, 'issues') || []
      },
      optimization: {
        suggestions: this.extractListItems(content, 'optimization') || [],
        optimizedCode: this.extractCode(content)
      },
      codeQuality: {
        score: this.extractScore(content) || 7,
        improvements: this.extractListItems(content, 'improvement') || []
      },
      edgeCases: this.extractListItems(content, 'edge case') || []
    };
  }

  private extractSection(content: string, section: string): string | null {
    const regex = new RegExp(`\\*\\*${section}:?\\*\\*\\s*([^\\n*]+)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : null;
  }

  private extractListItems(content: string, keyword: string): string[] {
    const lines = content.split('\n');
    const items: string[] = [];
    
    let inSection = false;
    for (const line of lines) {
      if (line.toLowerCase().includes(keyword.toLowerCase())) {
        inSection = true;
        continue;
      }
      
      if (inSection && line.trim().startsWith('-')) {
        items.push(line.replace(/^-\s*/, '').trim());
      } else if (inSection && line.trim() && !line.startsWith(' ')) {
        break;
      }
    }
    
    return items;
  }

  private extractCode(content: string): string | undefined {
    const codeMatch = content.match(/```[\w]*\n([\s\S]*?)\n```/);
    return codeMatch ? codeMatch[1] : undefined;
  }

  private extractScore(content: string): number | null {
    const scoreMatch = content.match(/(\d+)\/10|score.*?(\d+)/i);
    if (scoreMatch) {
      return parseInt(scoreMatch[1] || scoreMatch[2]);
    }
    return null;
  }

  private getFallbackFeedback(): FeedbackResponse {
    return {
      timeComplexity: 'Unable to analyze - AI service unavailable',
      spaceComplexity: 'Unable to analyze - AI service unavailable',
      correctness: {
        isCorrect: true,
        issues: ['Please configure AI service for detailed analysis']
      },
      optimization: {
        suggestions: ['Configure OpenAI or Gemini API key for optimization suggestions']
      },
      codeQuality: {
        score: 7,
        improvements: ['AI service needed for code quality analysis']
      },
      edgeCases: ['Configure AI service to get edge case analysis']
    };
  }

  private createQuestionPrompt(request: ProblemGenerationRequest): string {
    const difficulty = this.getDifficultyForExperience(request.experienceLevel);
    
    return `
Generate a coding interview question suitable for a ${request.role} position at ${request.company} with ${request.experienceLevel} years of experience.

Requirements:
- Difficulty: ${difficulty}
- Appropriate for: ${request.role} role
- Company style: ${request.company}
- Experience level: ${request.experienceLevel} years

Please provide the response in this exact JSON format:
{
  "title": "Problem Title",
  "description": "Clear problem description explaining what needs to be solved",
  "examples": [
    {
      "input": "example input",
      "output": "expected output",
      "explanation": "brief explanation of why this output is correct"
    }
  ],
  "constraints": [
    "constraint 1",
    "constraint 2"
  ],
  "difficulty": "${difficulty}",
  "defaultCode": "function solutionFunction(params) {\\n    // Write your solution here\\n    \\n}"
}

Make the problem relevant to the company and role. For example:
- Google: Focus on algorithms, data structures, system scalability
- Meta: Social networks, user interactions, real-time systems
- Amazon: E-commerce, logistics, distributed systems
- Apple: User experience, performance optimization, mobile
- Microsoft: Enterprise solutions, cloud computing, productivity tools

Ensure the problem is:
1. Clear and well-defined
2. Has at least 2 examples
3. Includes relevant constraints
4. Provides appropriate starter code
5. Is neither too easy nor too hard for the experience level
`;
  }

  private async callOpenAIForQuestion(prompt: string, request: ProblemGenerationRequest): Promise<GeneratedProblem> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert technical interviewer who creates challenging and relevant coding problems. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return this.parseQuestionResponse(data.choices[0].message.content, request);
  }

  private async callGeminiForQuestion(prompt: string, request: ProblemGenerationRequest): Promise<GeneratedProblem> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }),
    });

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return this.parseQuestionResponse(content, request);
  }

  private parseQuestionResponse(content: string, request: ProblemGenerationRequest): GeneratedProblem {
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          id: `ai_${Date.now()}`,
          title: parsed.title || 'AI Generated Problem',
          description: parsed.description || 'Problem description not available',
          examples: parsed.examples || [
            { input: 'Example input', output: 'Expected output', explanation: 'Explanation' }
          ],
          constraints: parsed.constraints || ['No specific constraints provided'],
          difficulty: parsed.difficulty || this.getDifficultyForExperience(request.experienceLevel),
          defaultCode: parsed.defaultCode || 'function solution() {\n    // Write your solution here\n    \n}'
        };
      }
    } catch (error) {
      console.error('Failed to parse AI question response:', error);
    }
    
    return this.getFallbackQuestion(request);
  }

  private getDifficultyForExperience(years: number): 'Easy' | 'Medium' | 'Hard' {
    if (years <= 1) return 'Easy';
    if (years <= 5) return 'Medium';
    return 'Hard';
  }

  private getFallbackQuestion(request: ProblemGenerationRequest): GeneratedProblem {
    const difficulty = this.getDifficultyForExperience(request.experienceLevel);
    
    // Simple questions that don't require AI
    const fallbackQuestions = [
      {
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        examples: [
          { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] == 9' }
        ],
        constraints: ['2 <= nums.length <= 10^4', 'Only one valid answer exists.'],
        defaultCode: 'function twoSum(nums, target) {\n    // Write your solution here\n    \n}'
      },
      {
        title: 'Reverse String',
        description: 'Write a function that reverses a string. The input string is given as an array of characters s.',
        examples: [
          { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' }
        ],
        constraints: ['1 <= s.length <= 10^5'],
        defaultCode: 'function reverseString(s) {\n    // Write your solution here\n    \n}'
      }
    ];
    
    const randomQuestion = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
    
    return {
      id: `fallback_${Date.now()}`,
      title: randomQuestion.title,
      description: randomQuestion.description,
      examples: randomQuestion.examples,
      constraints: randomQuestion.constraints,
      difficulty,
      defaultCode: randomQuestion.defaultCode
    };
  }
}

// Export a singleton instance
export const aiService = new AIService();