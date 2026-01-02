import { useState } from "react";
import { Send, FileText, MessageCircle, Copy, Download, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type ChatMode = "consultation" | "letter";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type: "text" | "letter";
}

const mockMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "السلام عليكم ورحمة الله وبركاته،\n\nأنا مستشارك الحكومي المتخصص. كيف يمكنني خدمتكم اليوم؟\n\nيمكنكم الاختيار بين:\n• **الاستشارة**: للاستفسار عن الإجراءات والأنظمة الحكومية\n• **صياغة خطاب**: لإعداد المعاريض والخطابات الرسمية",
    type: "text",
  },
];

export function ChatInterface() {
  const [mode, setMode] = useState<ChatMode>("consultation");
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      type: "text",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          mode === "letter"
            ? "سأقوم بإعداد الخطاب المطلوب. يرجى تزويدي بالمعلومات التالية:\n\n• الجهة المرسل إليها\n• موضوع الخطاب\n• الاسم الكامل\n• رقم الهوية\n• رقم الجوال"
            : "بناءً على استفساركم، وبعد البحث في المصادر الرسمية:\n\n**النتيجة:**\nيمكنكم تقديم طلبكم عبر منصة أبشر الإلكترونية.\n\n**المصدر:**\n[absher.sa](https://absher.sa)",
        type: mode === "letter" ? "letter" : "text",
      };
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 p-4 glass">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h1 className="font-semibold text-lg">المستشار الحكومي</h1>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center bg-secondary rounded-lg p-1 border border-border">
            <button
              onClick={() => setMode("consultation")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                mode === "consultation"
                  ? "bg-primary text-primary-foreground glow-green-subtle"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageCircle className="w-4 h-4" />
              استشارة
            </button>
            <button
              onClick={() => setMode("letter")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                mode === "letter"
                  ? "bg-accent text-accent-foreground glow-gold-subtle"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="w-4 h-4" />
              صياغة خطاب
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isTyping && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border/50 p-4 glass">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                mode === "consultation"
                  ? "اكتب استفسارك هنا..."
                  : "صف الخطاب المطلوب..."
              }
              className="w-full bg-secondary/50 border border-border rounded-xl py-4 px-5 pr-5 pl-14 text-base placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:glow-green-subtle transition-all resize-none min-h-[60px] max-h-[200px]"
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              size="icon"
              className="absolute left-3 bottom-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            يستند المستشار على المصادر الرسمية فقط (*.gov.sa)
          </p>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        !isAssistant && "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center",
          isAssistant
            ? "bg-primary/20 border border-primary/30"
            : "bg-accent/20 border border-accent/30"
        )}
      >
        {isAssistant ? (
          <Sparkles className="w-4 h-4 text-primary" />
        ) : (
          <span className="text-xs font-semibold text-accent">أ</span>
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex-1 max-w-[85%]",
          !isAssistant && "flex justify-end"
        )}
      >
        <div
          className={cn(
            "rounded-2xl p-4",
            isAssistant
              ? "bg-secondary/80 border border-border/50"
              : "bg-primary/10 border border-primary/20"
          )}
        >
          {/* Letter Document View */}
          {message.type === "letter" && isAssistant ? (
            <div className="space-y-3">
              <div className="document-paper rounded-lg text-right leading-loose">
                <p className="text-center text-lg mb-4">بسم الله الرحمن الرحيم</p>
                <p className="mb-4">معالي وزير الداخلية المحترم</p>
                <p className="mb-4">
                  <strong>الموضوع:</strong> طلب [الموضوع]
                </p>
                <p className="mb-4 text-justify">
                  السلام عليكم ورحمة الله وبركاته، وبعد:
                </p>
                <p className="mb-4 text-justify">
                  نتقدم لمعاليكم بهذا الطلب راجين من الله ثم من معاليكم النظر فيه
                  والتكرم بالموافقة عليه.
                </p>
                <p className="mb-8">
                  وتفضلوا بقبول وافر الاحترام والتقدير
                </p>
                <div className="flex justify-between items-end">
                  <div>
                    <p>التاريخ: ___/___/____هـ</p>
                    <p>التوقيع: ____________</p>
                  </div>
                  <div className="text-left">
                    <p>مقدمه: [الاسم]</p>
                    <p>رقم الهوية: [الرقم]</p>
                    <p>الجوال: [الرقم]</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" size="sm">
                  <Copy className="w-4 h-4 ml-2" />
                  نسخ
                </Button>
                <Button variant="premium" size="sm">
                  <Download className="w-4 h-4 ml-2" />
                  تحميل PDF
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none">
              {message.content.split("\n").map((line, i) => (
                <p key={i} className={cn("mb-2 last:mb-0", !line && "h-2")}>
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
