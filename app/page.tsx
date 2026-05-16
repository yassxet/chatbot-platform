import Link from "next/link";
import { Bot, Zap, Shield, Globe, ArrowRight, CheckCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-indigo-600 text-lg">
            <Bot size={22} />
            <span>BotForge</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/demo"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Live Demo
            </Link>
            <Link
              href="/dashboard"
              className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full mb-6">
            <Zap size={12} />
            Powered by Claude AI
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            Your company documents.
            <br />
            <span className="text-indigo-600">Answered instantly.</span>
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
            Upload your PDFs, docs, and text files. BotForge trains a chatbot on
            them and drops it on your website in minutes — no coding required.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-semibold shadow-lg shadow-indigo-200"
            >
              Start for free <ArrowRight size={16} />
            </Link>
            <Link
              href="/demo"
              className="flex items-center gap-2 border border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
            >
              See live demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Bot className="text-indigo-600" size={24} />,
              title: "RAG-Powered Answers",
              desc: "Claude reads your documents and answers questions with source citations — only from your data.",
            },
            {
              icon: <Globe className="text-indigo-600" size={24} />,
              title: "One Script Tag",
              desc: "Embed on any website with a single line of HTML. Works on WordPress, Shopify, custom sites — everywhere.",
            },
            {
              icon: <Shield className="text-indigo-600" size={24} />,
              title: "Secure by Default",
              desc: "Your documents stay private. API keys never touch the client. Rate limiting built in.",
            },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Up and running in 3 steps
          </h2>
          <div className="space-y-8 text-left">
            {[
              {
                step: "01",
                title: "Upload your documents",
                desc: "Drag and drop PDFs, Word docs, or text files. We chunk, embed, and index everything automatically.",
              },
              {
                step: "02",
                title: "Customize your chatbot",
                desc: "Set a name, brand color, and logo. Preview the widget live before publishing.",
              },
              {
                step: "03",
                title: "Paste one line of code",
                desc: "Copy the embed script and paste it before </body>. Your chatbot is live.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6">
                <div className="shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4 bg-indigo-600">
        <div className="max-w-xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Free to start</h2>
          <p className="text-indigo-200 mb-8">
            Total infrastructure cost under $0/month until you have real
            traffic. Pay only for what you use.
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm text-left mb-8">
            {[
              "Unlimited chatbots",
              "PDF, DOCX, TXT support",
              "Streaming responses",
              "Source citations",
              "Embed script",
              "Conversation logs",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <CheckCircle size={14} className="text-indigo-300 shrink-0" />
                <span className="text-indigo-100">{f}</span>
              </div>
            ))}
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            Create your first bot <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-sm text-gray-400 border-t border-gray-100">
        © {new Date().getFullYear()} BotForge — MIT License
      </footer>
    </div>
  );
}
