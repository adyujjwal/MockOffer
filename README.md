<div align="center">

# 🎯 MockOffer

![MockOffer](https://img.shields.io/badge/MockOffer-AI%20Interview%20Platform-D4AF37?style=for-the-badge&logo=openai&logoColor=white)

### AI-Powered Mock Coding Interview Platform

**Practice coding interviews with personalized questions from top tech companies and get instant AI feedback on your solutions.**

[![Next.js](https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI%20GPT--4-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)
[![Monaco Editor](https://img.shields.io/badge/Monaco%20Editor-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white)](https://microsoft.github.io/monaco-editor/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [Contributing](#-contributing)

</div>

---

## 🚀 Why MockOffer?

Landing your dream job at top tech companies requires more than just knowing how to code—it requires **practice under real interview conditions**. MockOffer bridges the gap between self-study and actual interviews by providing:

| | |
|---|---|
| 🎯 **Company-Specific Questions** | Practice with questions tailored to Google, Meta, Amazon, Apple, Microsoft, and more |
| ⏱️ **Timed Sessions** | Build speed and confidence with customizable interview timers (1-120 min) |
| 🤖 **Instant AI Feedback** | Get detailed analysis of correctness, complexity, and code quality |
| 📊 **Track Progress** | Review your interview history and see improvement over time |
| 💻 **Multi-Language Support** | Code in JavaScript, TypeScript, Python, Java, C++, C#, Go, or Rust |

> Whether you're preparing for FAANG interviews or your first tech role, MockOffer helps you practice smarter, not harder.

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎯 Smart Question Generation
- AI generates unique coding problems based on:
  - Target company (Google, Meta, Amazon, etc.)
  - Role (Frontend, Backend, Full Stack, SDE)
  - Experience level (0-15+ years)
- Questions match real interview patterns

</td>
<td width="50%">

### 🤖 AI-Powered Feedback
- **Time & Space Complexity** analysis
- **Correctness** verification with issue detection
- **Code Quality** scoring (1-10 scale)
- **Optimization** suggestions with improved code
- **Edge Cases** identification

</td>
</tr>
<tr>
<td width="50%">

### 💻 Professional Code Editor
- Monaco Editor (VS Code's engine)
- Syntax highlighting for 8 languages
- Auto-generated function templates
- IntelliSense & auto-formatting
- Dark theme optimized for coding

</td>
<td width="50%">

### 📊 Interview Dashboard
- Complete session history
- Code submission review
- AI feedback archive
- User-specific data isolation
- Bulk session management

</td>
</tr>
<tr>
<td width="50%">

### ⏱️ Customizable Timer
- Set duration (1-120 minutes)
- Start, stop, reset controls
- Auto-submit on expiry
- Real-time countdown display

</td>
<td width="50%">

### 🔐 Secure Authentication
- Powered by Clerk
- Email/password & social logins
- Protected routes & sessions
- User-specific data storage

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<div align="center">

| Category | Technology |
|:--------:|:----------:|
| **Framework** | ![Next.js](https://img.shields.io/badge/Next.js%2015-000000?style=flat-square&logo=nextdotjs&logoColor=white) App Router |
| **Language** | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) Strict Mode |
| **Styling** | ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) Custom Theme |
| **AI Engine** | ![OpenAI](https://img.shields.io/badge/GPT--4o--mini-412991?style=flat-square&logo=openai&logoColor=white) JSON Mode |
| **Authentication** | ![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=flat-square&logo=clerk&logoColor=white) Complete Auth |
| **Code Editor** | ![Monaco](https://img.shields.io/badge/Monaco-007ACC?style=flat-square&logo=visualstudiocode&logoColor=white) VS Code Engine |
| **Deployment** | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white) Edge Optimized |

</div>

---

## 📦 Installation

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, or pnpm
- OpenAI API key
- Clerk account

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/mockoffer.git
cd mockoffer

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# OpenAI API
OPENAI_API_KEY=sk-...
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎮 Usage

1. **Sign Up/Login** — Create an account or sign in
2. **Start Interview** — Click "Start Interview Session"
3. **Configure** — Select company, role, and experience level
4. **Set Timer** — Choose your interview duration
5. **Code** — Write your solution in the Monaco editor
6. **Submit** — Get instant AI feedback
7. **Review** — Track progress in your dashboard

---

## 📁 Project Structure

```
mockoffer/
├── app/
│   ├── api/ai/
│   │   ├── generate-question/    # AI question generation
│   │   └── generate-feedback/    # AI code analysis
│   ├── dashboard/                # User dashboard
│   ├── interview/                # Interview session
│   ├── (auth)/                   # Auth pages
│   ├── globals.css               # Global styles
│   └── layout.tsx                # Root layout
├── components/
│   ├── InterviewSetupModal.tsx   # Session config
│   ├── LoadingProvider.tsx       # Loading state
│   └── MockOfferLogo.tsx         # Brand logo
└── public/                       # Static assets
```

---

## 🎨 Design

MockOffer features a **Luxury Noir** theme:

- **Primary**: Gold (#D4AF37) — Excellence & achievement
- **Background**: Deep blacks — Professional & focused
- **Accents**: Gradient glows — Modern & engaging

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ for developers preparing for their dream jobs**

⭐ Star this repo if you found it helpful!

</div>
