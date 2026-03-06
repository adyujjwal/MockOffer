# Environment Variables Setup

Copy this content to `.env.local` and fill in your actual values:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# OpenAI API (optional - replace with Gemini if preferred)
OPENAI_API_KEY=your_openai_api_key_here

# Alternative: Google Gemini API
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
```

## How to get these keys:

### Clerk Authentication
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Copy your publishable key and secret key from the API Keys section

### OpenAI API
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account and add payment method
3. Generate an API key from the API Keys section

### Google Gemini API (Alternative)
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Use this instead of OpenAI if preferred