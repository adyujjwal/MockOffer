interface InterviewQuestion {
  id: string;
  title: string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  defaultCode: string;
  company: string;
  experienceLevel: string;
  role: string;
}

// Company-specific interview questions database
const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  // Google Questions
  {
    id: 'google_1',
    title: 'Valid Parentheses',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets, and Open brackets must be closed in the correct order.',
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' }
    ],
    constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only \'()[]{}\'.'],
    difficulty: 'Easy',
    defaultCode: `function isValid(s) {
    // Write your solution here
    
}`,
    company: 'Google',
    experienceLevel: '0',
    role: 'Software Engineer'
  },
  {
    id: 'google_2',
    title: 'LRU Cache',
    description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class with get(key) and put(key, value) methods.',
    examples: [
      { input: 'LRUCache(2); put(1, 1); put(2, 2); get(1);', output: '1', explanation: 'Returns 1' },
      { input: 'put(3, 3); get(2);', output: '-1', explanation: 'Returns -1 (not found)' }
    ],
    constraints: ['1 <= capacity <= 3000', '0 <= key <= 10^4', '0 <= value <= 10^5'],
    difficulty: 'Medium',
    defaultCode: `class LRUCache {
    constructor(capacity) {
        // Initialize your data structure here
    }
    
    get(key) {
        // Write your solution here
    }
    
    put(key, value) {
        // Write your solution here
    }
}`,
    company: 'Google',
    experienceLevel: '4',
    role: 'Software Engineer'
  },
  
  // Meta Questions
  {
    id: 'meta_1',
    title: 'Move Zeroes',
    description: 'Given an integer array nums, move all 0s to the end of it while maintaining the relative order of the non-zero elements. Note that you must do this in-place without making a copy of the array.',
    examples: [
      { input: 'nums = [0,1,0,3,12]', output: '[1,3,12,0,0]' },
      { input: 'nums = [0]', output: '[0]' }
    ],
    constraints: ['1 <= nums.length <= 10^4', '-2^31 <= nums[i] <= 2^31 - 1'],
    difficulty: 'Easy',
    defaultCode: `function moveZeroes(nums) {
    // Write your solution here
    
}`,
    company: 'Meta',
    experienceLevel: '0',
    role: 'Software Engineer'
  },
  {
    id: 'meta_2',
    title: 'Binary Tree Vertical Order Traversal',
    description: 'Given the root of a binary tree, return the vertical order traversal of its nodes\' values. (i.e., from top to bottom, column by column).',
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '[[9],[3,15],[20],[7]]' }
    ],
    constraints: ['The number of nodes in the tree is in the range [0, 100]', '-100 <= Node.val <= 100'],
    difficulty: 'Medium',
    defaultCode: `function verticalOrder(root) {
    // Write your solution here
    
}`,
    company: 'Meta',
    experienceLevel: '4',
    role: 'Software Engineer'
  },

  // Amazon Questions
  {
    id: 'amazon_1',
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Only one valid answer exists.'],
    difficulty: 'Easy',
    defaultCode: `function twoSum(nums, target) {
    // Write your solution here
    
}`,
    company: 'Amazon',
    experienceLevel: '0',
    role: 'Software Engineer'
  },
  {
    id: 'amazon_2',
    title: 'Critical Connections in a Network',
    description: 'There are n servers numbered from 0 to n - 1 connected by undirected server-to-server connections forming a network. Return all critical connections.',
    examples: [
      { input: 'n = 4, connections = [[0,1],[1,2],[2,0],[1,3]]', output: '[[1,3]]' }
    ],
    constraints: ['2 <= n <= 10^5', 'n - 1 <= connections.length <= 10^5'],
    difficulty: 'Hard',
    defaultCode: `function criticalConnections(n, connections) {
    // Write your solution here
    
}`,
    company: 'Amazon',
    experienceLevel: '7',
    role: 'Software Engineer'
  },

  // Microsoft Questions
  {
    id: 'microsoft_1',
    title: 'Reverse Integer',
    description: 'Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2^31, 2^31 - 1], then return 0.',
    examples: [
      { input: 'x = 123', output: '321' },
      { input: 'x = -123', output: '-321' },
      { input: 'x = 120', output: '21' }
    ],
    constraints: ['-2^31 <= x <= 2^31 - 1'],
    difficulty: 'Medium',
    defaultCode: `function reverse(x) {
    // Write your solution here
    
}`,
    company: 'Microsoft',
    experienceLevel: '2',
    role: 'Software Engineer'
  },

  // Apple Questions
  {
    id: 'apple_1',
    title: 'Number of Islands',
    description: 'Given an m x n 2D binary grid which represents a map of \'1\'s (land) and \'0\'s (water), return the number of islands.',
    examples: [
      { 
        input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', 
        output: '1' 
      }
    ],
    constraints: ['m == grid.length', 'n == grid[i].length', '1 <= m, n <= 300'],
    difficulty: 'Medium',
    defaultCode: `function numIslands(grid) {
    // Write your solution here
    
}`,
    company: 'Apple',
    experienceLevel: '4',
    role: 'Software Engineer'
  }
];

export function getInterviewQuestion(company: string, experienceLevel: string, role: string): InterviewQuestion {
  // First, try to find exact match
  let question = INTERVIEW_QUESTIONS.find(q => 
    q.company === company && 
    q.experienceLevel === experienceLevel && 
    q.role === role
  );

  // If no exact match, find by company and experience level
  if (!question) {
    question = INTERVIEW_QUESTIONS.find(q => 
      q.company === company && 
      q.experienceLevel === experienceLevel
    );
  }

  // If still no match, find by company
  if (!question) {
    question = INTERVIEW_QUESTIONS.find(q => q.company === company);
  }

  // Default fallback - return Amazon Two Sum for beginners
  if (!question) {
    question = INTERVIEW_QUESTIONS.find(q => q.id === 'amazon_1');
  }

  return question || INTERVIEW_QUESTIONS[0]; // Ultimate fallback
}

export function generateCompanyFeedback(company: string, role: string, experienceLevel: string) {
  const expMap: { [key: string]: string } = {
    '0': 'New Grad',
    '2': 'Junior',
    '4': 'Mid-level',
    '7': 'Senior',
    '11': 'Staff+'
  };

  const expLabel = expMap[experienceLevel] || 'Entry';

  return `
## ${company} Interview Analysis

**Position:** ${role} (${expLabel} Level)  
**Company:** ${company}

## Technical Assessment:
✅ **Problem Approach:** Your solution demonstrates solid understanding of the core concepts
⚠️ **${company} Standards:** Consider optimizing for scale - ${company} processes massive amounts of data
✅ **Code Quality:** Clean and readable implementation

## ${company}-Specific Feedback:
${getCompanySpecificFeedback(company)}

## Interview Tips for ${company}:
- Focus on scalability and performance optimization
- Be prepared to discuss system design implications
- Show understanding of ${company}'s technical challenges
- Consider edge cases and error handling thoroughly

## Next Steps:
Practice more ${company}-style problems focusing on:
- Data structures and algorithms optimization
- System design principles
- Clean coding practices
  `;
}

function getCompanySpecificFeedback(company: string): string {
  const feedbackMap: { [key: string]: string } = {
    'Google': '• Google values algorithmic thinking and clean code\n• Consider discussing time/space complexity trade-offs\n• Think about how this scales to Google\'s infrastructure',
    'Meta': '• Meta emphasizes user-centric solutions\n• Consider the impact on billions of users\n• Think about real-time processing and social graph implications',
    'Amazon': '• Amazon focuses on customer obsession and operational excellence\n• Consider cost optimization and reliability\n• Think about AWS-scale distributed systems',
    'Apple': '• Apple values elegant, user-focused solutions\n• Consider performance on mobile devices\n• Think about privacy and security implications',
    'Microsoft': '• Microsoft emphasizes enterprise-grade solutions\n• Consider backward compatibility and integration\n• Think about developer experience and productivity tools'
  };

  return feedbackMap[company] || '• Focus on writing maintainable, scalable code\n• Consider the business impact of your solution\n• Think about long-term technical considerations';
}