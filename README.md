# 🤖 AI Chatbot Agent Platform

> Embeddable AI chatbot powered by Claude — trained on your company's documents. Sell it to any business, drop it on any website.

---

## What This Is

A two-part product:

**Part 1 — The AI Engine**
Upload PDFs, text files, or Word docs about your company. The AI reads them, understands them, and answers customer questions accurately — only using the information you provided.

**Part 2 — The Live Demo Platform**
Type any website URL, add a logo, pick a color. See your chatbot appear on that website in real-time. Perfect for sales demos.

---

## How It Works (Simple Version)

```
Your Documents (PDF/TXT/DOCX)
        ↓
   Text Extraction
        ↓
   Chunked + Indexed (Vector DB)
        ↓
Customer asks a question
        ↓
System finds relevant chunks
        ↓
Claude generates an answer
        ↓
Customer gets a helpful reply ✅
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- Anthropic API key (claude.ai/api)
- Supabase account (free)
- Clerk account (free)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/yourname/chatbot-platform
cd chatbot-platform

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your API keys

# 4. Run development server
npm run dev
```

### Environment Variables

```bash
ANTHROPIC_API_KEY=           # Get from console.anthropic.com
OPENAI_API_KEY=              # For embeddings (text-embedding-3-small)
NEXT_PUBLIC_SUPABASE_URL=    # From Supabase dashboard
SUPABASE_SERVICE_ROLE_KEY=   # From Supabase dashboard
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

---

## Project Structure

```
chatbot-platform/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── dashboard/         # Bot management dashboard
│   ├── demo/              # Live demo platform
│   ├── chat/[botId]/      # Embeddable chat page
│   └── api/               # Backend API routes
│       ├── chat/          # RAG chat endpoint
│       ├── ingest/        # Document upload + indexing
│       └── bots/          # Bot CRUD operations
├── components/            # React components
│   ├── ChatWidget.tsx     # Floating chat bubble
│   ├── ChatWindow.tsx     # Full chat interface
│   ├── DemoFrame.tsx      # Website preview frame
│   ├── FileUploader.tsx   # Document upload UI
│   └── BotCustomizer.tsx  # Color/logo/name settings
├── lib/                   # Core business logic
│   ├── anthropic.ts       # AI client
│   ├── rag.ts             # Retrieval-augmented generation
│   ├── ingest.ts          # Document processing
│   ├── embeddings.ts      # Vector embeddings
│   └── vectorstore.ts     # Vector DB operations
└── public/
    └── embed.js           # Drop-in embed script
```

---

## Embedding the Chatbot

Once a chatbot is created and documents are uploaded, adding it to any website takes one line:

```html
<script src="https://yourplatform.com/embed.js" data-bot-id="YOUR_BOT_ID"></script>
```

That's it. The widget appears bottom-right, floats over the website, and is ready to answer questions.

---

## Key Features

| Feature | Status |
|---|---|
| PDF/TXT/DOCX ingestion | ✅ |
| RAG-based answers | ✅ |
| Claude AI (sonnet-4) | ✅ |
| Streaming responses | ✅ |
| Bot customization | ✅ |
| Embed script | ✅ |
| Live demo platform | ✅ |
| Conversation logging | ✅ |
| Source citations | ✅ |
| Mobile responsive | ✅ |

---

## API Reference

### POST `/api/ingest`
Upload documents for a bot.

```json
// Request (multipart/form-data)
{ "botId": "abc123", "file": <File> }

// Response
{ "success": true, "chunksIndexed": 47 }
```

### POST `/api/chat`
Send a message and get an AI response.

```json
// Request
{
  "botId": "abc123",
  "message": "What are your business hours?",
  "history": []
}

// Response (streaming)
{ "reply": "We're open Monday to Friday, 9am to 6pm..." }
```

### GET `/api/bots/:id`
Get bot configuration (name, colors, logo).

---

## Deployment

```bash
# Deploy to Vercel (recommended)
npm install -g vercel
vercel --prod
```

Add all environment variables in the Vercel dashboard under Project Settings → Environment Variables.

---

## Tech Stack Decisions

| Choice | Why |
|---|---|
| **Next.js** | API + frontend in one repo, easy Vercel deployment |
| **Claude Sonnet 4** | Best long-context understanding, perfect for documents |
| **Chroma DB** | Free, local vector store, zero infra needed to start |
| **Supabase** | Free PostgreSQL + storage, great DX |
| **Clerk** | Auth in 10 minutes, free tier generous |
| **Vercel** | Free hosting, auto-scaling, edge functions |

Total cost to run: **~$0/month** until you have real traffic.

---

## Roadmap

- [ ] Analytics dashboard (most asked questions, unanswered queries)
- [ ] Multi-language support
- [ ] Lead capture (collect email before chatting)
- [ ] Handoff to human (WhatsApp / email escalation)
- [ ] Conversation starters (quick-reply buttons)
- [ ] White-label dashboard for clients
- [ ] Usage billing per conversation
- [ ] n8n integration for auto-document sync

---

## License

MIT — build whatever you want with it.
