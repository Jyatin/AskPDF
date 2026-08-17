import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, FileText } from "lucide-react";
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

export default function ChatPanel({ documentId, onNavigateToPage }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content: "Hello! I've read your document. What would you like to know about it?",
    }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const MAX_HISTORY_MESSAGES = 10;

  const buildHistory = (): ChatHistoryMessage[] => {
    // Filter out the welcome message and take the most recent messages
    const conversationMessages = messages.filter((m) => m.id !== "welcome");
    const recent = conversationMessages.slice(-MAX_HISTORY_MESSAGES);
    return recent.map((m) => ({ role: m.role, content: m.content }));
  };

  const chatMutation = useMutation({
    mutationFn: async (question: string) => {
      const history = buildHistory();
      return await chatApi(documentId, question, history);
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "ai",
          content: data.answer,
          sources: data.sources,
        },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "ai",
          content: "Sorry, I encountered an error while trying to answer your question. Please try again.",
        },
      ]);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const question = input.trim();
    setInput("");
    
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: question },
    ]);

    chatMutation.mutate(question);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-cream">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-4 max-w-2xl mx-auto", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
              msg.role === "ai" 
                ? "bg-cream-dark text-teal border-border/80" 
                : "bg-charcoal text-cream border-charcoal-light"
            )}>
              {msg.role === "ai" ? <Bot className="w-4 h-4 stroke-[1.5]" /> : <User className="w-4 h-4 stroke-[1.5]" />}
            </div>
            
            <div className={cn(
              "flex flex-col gap-2 min-w-0",
              msg.role === "user" ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "px-5 py-3.5 text-[15px] leading-relaxed whitespace-pre-wrap font-light",
                msg.role === "user" 
                  ? "bg-charcoal text-cream rounded-2xl rounded-tr-sm shadow-sm" 
                  : "text-charcoal bg-white/50 border border-border/50 rounded-2xl rounded-tl-sm shadow-sm"
              )}>
                {msg.content}
              </div>
              
              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {msg.sources.map((source, i) => {
                    const label = source.pageNumber
                      ? `Page ${source.pageNumber}`
                      : `Chunk ${source.chunkIndex}`;
                    const isClickable = !!source.pageNumber && !!onNavigateToPage;

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (isClickable) onNavigateToPage!(source.pageNumber!);
                        }}
                        disabled={!isClickable}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/60 border border-border/60 rounded-full text-xs shadow-sm transition-all",
                          isClickable
                            ? "text-forest hover:bg-forest/10 hover:border-forest/40 cursor-pointer"
                            : "text-charcoal-light cursor-default"
                        )}
                        title={
                          isClickable
                            ? `Go to page ${source.pageNumber} (${(source.score * 100).toFixed(1)}% match)`
                            : `Similarity score: ${(source.score * 100).toFixed(1)}%`
                        }
                      >
                        <FileText className="w-3 h-3 text-teal" />
                        <span className="font-medium">{label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {chatMutation.isPending && (
          <div className="flex gap-4 max-w-2xl mx-auto">
            <div className="w-8 h-8 rounded-full bg-cream-dark text-teal border border-border/80 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 stroke-[1.5]" />
            </div>
            <div className="px-5 py-4 bg-white/50 border border-border/50 rounded-2xl rounded-tl-sm flex items-center gap-2 shadow-sm">
              <span className="w-1.5 h-1.5 bg-teal/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-teal/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-teal/60 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:px-8 md:pb-6 bg-cream shrink-0">
        <form 
          onSubmit={handleSubmit}
          className="relative flex items-end gap-2 max-w-2xl mx-auto"
        >
          <div className="relative flex-1 bg-white/80 backdrop-blur-sm border border-border/80 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-teal/30 focus-within:border-teal transition-all shadow-sm">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about the document..."
              className="w-full max-h-48 min-h-[60px] py-4 pl-5 pr-14 bg-transparent text-[15px] font-light text-charcoal placeholder:text-charcoal-light/60 resize-none outline-none leading-relaxed"
              rows={1}
              disabled={chatMutation.isPending}
            />
            <button
              type="submit"
              disabled={!input.trim() || chatMutation.isPending}
              className="absolute right-2 bottom-2 w-10 h-10 flex items-center justify-center text-cream bg-charcoal hover:bg-forest disabled:bg-black/5 disabled:text-charcoal-light/40 rounded-xl transition-all shadow-sm"
            >
              {chatMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
        <div className="text-center mt-3">
          <p className="text-[11px] font-light text-charcoal-light/70 tracking-wide">AI may produce inaccurate information. Please verify important facts.</p>
        </div>
      </div>
    </div>
  );
}
