import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, FileText, Sparkles, Copy, Check, CornerDownLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { chatApi, type ChatHistoryMessage } from "../../../lib/api";
import { cn } from "../../../lib/utils";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  sources?: Array<{ chunkIndex: number; score: number; pageNumber?: number }>;
}

interface Props {
  documentId: string;
  onNavigateToPage?: (page: number) => void;
}

const suggestedPrompts = [
  "Give me a concise summary",
  "What are the key takeaways?",
  "Explain the main argument",
];

export default function ChatPanel({ documentId, onNavigateToPage }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content: "Hello! I've read your document. What would you like to know about it?",
    },
  ]);
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const MAX_HISTORY_MESSAGES = 10;

  const buildHistory = (): ChatHistoryMessage[] => {
    const conversationMessages = messages.filter((m) => m.id !== "welcome");
    return conversationMessages.slice(-MAX_HISTORY_MESSAGES).map((m) => ({
      role: m.role,
      content: m.content,
    }));
  };

  const chatMutation = useMutation({
    mutationFn: async (question: string) => chatApi(documentId, question, buildHistory()),
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "ai", content: data.answer, sources: data.sources },
      ]);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || "Unable to generate an answer right now. Please try again.";
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "ai", content: errorMessage },
      ]);
    },
  });

  const submitQuestion = (question: string) => {
    if (!question.trim() || chatMutation.isPending) return;
    const cleanQuestion = question.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-user`, role: "user", content: cleanQuestion },
    ]);
    chatMutation.mutate(cleanQuestion);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuestion(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitQuestion(input);
    }
  };

  const copyAnswer = async (message: Message) => {
    await navigator.clipboard.writeText(message.content);
    setCopiedId(message.id);
    window.setTimeout(() => setCopiedId(null), 1400);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-cream">
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-7 md:py-7">
        {messages.length === 1 && (
          <div className="mx-auto mb-7 max-w-2xl animate-askpdf-fade-up">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-teal">
              <Sparkles className="h-3.5 w-3.5" /> Start exploring
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => submitQuestion(prompt)}
                  className="rounded-full border border-border/80 bg-white/70 px-3.5 py-2 text-xs font-medium text-charcoal-light shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal/25 hover:bg-white hover:text-forest hover:shadow-md"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mx-auto max-w-2xl space-y-7">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "group flex gap-3.5 animate-askpdf-fade-up",
                msg.role === "user" ? "ml-auto max-w-[88%] flex-row-reverse" : "max-w-[96%]"
              )}
            >
              <div className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border shadow-sm",
                msg.role === "ai"
                  ? "border-teal/10 bg-teal/10 text-teal"
                  : "border-charcoal bg-charcoal text-cream"
              )}>
                {msg.role === "ai" ? <Bot className="h-4 w-4" strokeWidth={1.7} /> : <User className="h-4 w-4" strokeWidth={1.7} />}
              </div>

              <div className={cn("min-w-0", msg.role === "user" ? "items-end" : "items-start")}>
                <div className={cn(
                  "relative text-[14px] leading-7 whitespace-pre-wrap",
                  msg.role === "user"
                    ? "rounded-[20px] rounded-tr-md bg-charcoal px-4.5 py-3 text-cream shadow-[0_10px_25px_rgba(23,23,22,0.12)]"
                    : "rounded-[20px] rounded-tl-md border border-border/60 bg-white/70 px-4.5 py-3.5 text-charcoal shadow-[0_8px_25px_rgba(23,23,22,0.04)] backdrop-blur-sm"
                )}>
                  {msg.content}
                </div>

                {msg.role === "ai" && msg.id !== "welcome" && (
                  <button
                    type="button"
                    onClick={() => copyAnswer(msg)}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-medium text-charcoal-light/60 opacity-0 transition-all hover:bg-white hover:text-charcoal group-hover:opacity-100"
                  >
                    {copiedId === msg.id ? <Check className="h-3 w-3 text-teal" /> : <Copy className="h-3 w-3" />}
                    {copiedId === msg.id ? "Copied" : "Copy"}
                  </button>
                )}

                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {msg.sources.map((source, i) => {
                      const label = source.pageNumber ? `Page ${source.pageNumber}` : `Chunk ${source.chunkIndex}`;
                      const isClickable = !!source.pageNumber && !!onNavigateToPage;
                      return (
                        <button
                          key={`${source.chunkIndex}-${i}`}
                          type="button"
                          onClick={() => isClickable && onNavigateToPage!(source.pageNumber!)}
                          disabled={!isClickable}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold shadow-sm transition-all",
                            isClickable
                              ? "border-teal/15 bg-teal/5 text-forest hover:-translate-y-0.5 hover:border-teal/30 hover:bg-teal/10"
                              : "cursor-default border-border/60 bg-white/50 text-charcoal-light"
                          )}
                          title={isClickable ? `Go to page ${source.pageNumber}` : `Similarity score: ${(source.score * 100).toFixed(1)}%`}
                        >
                          <FileText className="h-3 w-3 text-teal" />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}

          {chatMutation.isPending && (
            <div className="flex max-w-[96%] gap-3.5 animate-askpdf-fade-up">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-teal/10 bg-teal/10 text-teal">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-[20px] rounded-tl-md border border-border/60 bg-white/70 px-5 py-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal/70 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal/70 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal/70" />
                  <span className="ml-2 text-[10px] font-medium uppercase tracking-[0.12em] text-charcoal-light/60">Thinking</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="shrink-0 border-t border-border/50 bg-cream/90 px-4 pb-4 pt-3 backdrop-blur-xl md:px-7 md:pb-6">
        <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
          <div className="group relative rounded-[22px] border border-border/80 bg-white/85 p-1.5 shadow-[0_12px_40px_rgba(23,23,22,0.07)] backdrop-blur-md transition-all focus-within:border-teal/30 focus-within:shadow-[0_16px_50px_rgba(42,96,91,0.10)]">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about this document…"
              className="max-h-36 min-h-[58px] w-full resize-none bg-transparent px-4 py-3.5 pr-14 text-[14px] leading-6 text-charcoal outline-none placeholder:text-charcoal-light/45"
              rows={1}
              disabled={chatMutation.isPending}
            />
            <button
              type="submit"
              disabled={!input.trim() || chatMutation.isPending}
              className="absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-[14px] bg-charcoal text-cream shadow-md transition-all hover:-translate-y-0.5 hover:bg-forest disabled:cursor-not-allowed disabled:bg-cream-dark disabled:text-charcoal-light/35"
              aria-label="Send question"
            >
              {chatMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </form>
        <div className="mt-2 flex items-center justify-center gap-1.5 text-[9px] font-medium text-charcoal-light/50">
          <CornerDownLeft className="h-3 w-3" /> Enter to send · Shift + Enter for a new line · AI can make mistakes
        </div>
      </div>
    </div>
  );
}
