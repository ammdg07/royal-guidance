import { useState } from "react";
import { Plus, MessageSquare, Search, Settings, Crown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SHLLogo } from "./SHLLogo";

interface ChatHistory {
  id: string;
  title: string;
  date: string;
  group: "today" | "yesterday" | "older";
}

const mockHistory: ChatHistory[] = [
  { id: "1", title: "استفسار عن تجديد الإقامة", date: "2024-01-15", group: "today" },
  { id: "2", title: "خطاب اعتراض على مخالفة", date: "2024-01-15", group: "today" },
  { id: "3", title: "إجراءات نقل الكفالة", date: "2024-01-14", group: "yesterday" },
  { id: "4", title: "طلب تأشيرة خروج وعودة", date: "2024-01-14", group: "yesterday" },
  { id: "5", title: "خطاب للجوازات", date: "2024-01-10", group: "older" },
];

interface ChatSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function ChatSidebar({ isCollapsed, onToggle }: ChatSidebarProps) {
  const [activeChat, setActiveChat] = useState<string | null>("1");

  const groupedHistory = {
    today: mockHistory.filter(h => h.group === "today"),
    yesterday: mockHistory.filter(h => h.group === "yesterday"),
    older: mockHistory.filter(h => h.group === "older"),
  };

  return (
    <aside
      className={cn(
        "h-screen glass-strong flex flex-col transition-all duration-300 relative",
        isCollapsed ? "w-16" : "w-72"
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -left-3 top-6 z-50 w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-muted-foreground" />
        )}
      </button>

      {/* Header */}
      <div className={cn(
        "p-4 border-b border-border/50",
        isCollapsed && "flex justify-center"
      )}>
        <SHLLogo size={isCollapsed ? "sm" : "md"} showText={!isCollapsed} />
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          variant="neon"
          className={cn(
            "w-full justify-center",
            isCollapsed && "px-0"
          )}
        >
          <Plus className="w-4 h-4" />
          {!isCollapsed && <span>محادثة جديدة</span>}
        </Button>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="px-3 pb-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="البحث في المحادثات..."
              className="w-full bg-secondary/50 border border-border rounded-lg py-2 pr-9 pl-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:glow-green-subtle transition-all"
            />
          </div>
        </div>
      )}

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
        {!isCollapsed ? (
          <>
            {/* Today */}
            {groupedHistory.today.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-medium text-muted-foreground px-2 mb-2">اليوم</h3>
                {groupedHistory.today.map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={activeChat === chat.id}
                    onClick={() => setActiveChat(chat.id)}
                  />
                ))}
              </div>
            )}

            {/* Yesterday */}
            {groupedHistory.yesterday.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-medium text-muted-foreground px-2 mb-2">أمس</h3>
                {groupedHistory.yesterday.map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={activeChat === chat.id}
                    onClick={() => setActiveChat(chat.id)}
                  />
                ))}
              </div>
            )}

            {/* Older */}
            {groupedHistory.older.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-medium text-muted-foreground px-2 mb-2">سابقاً</h3>
                {groupedHistory.older.map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={activeChat === chat.id}
                    onClick={() => setActiveChat(chat.id)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-2 py-2">
            {mockHistory.slice(0, 5).map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className={cn(
                  "w-full p-2 rounded-lg flex items-center justify-center transition-all",
                  activeChat === chat.id
                    ? "bg-primary/20 border-glow-green"
                    : "hover:bg-secondary"
                )}
              >
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border/50 space-y-2">
        {/* Premium Badge */}
        <Button
          variant="premium"
          className={cn(
            "w-full justify-center",
            isCollapsed && "px-0"
          )}
        >
          <Crown className="w-4 h-4" />
          {!isCollapsed && <span>ترقية للنسخة المميزة</span>}
        </Button>

        {/* Settings */}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-center text-muted-foreground",
            isCollapsed && "px-0"
          )}
        >
          <Settings className="w-4 h-4" />
          {!isCollapsed && <span>الإعدادات</span>}
        </Button>
      </div>
    </aside>
  );
}

function ChatItem({
  chat,
  isActive,
  onClick,
}: {
  chat: ChatHistory;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-right p-3 rounded-lg flex items-center gap-3 transition-all group",
        isActive
          ? "bg-primary/10 border border-primary/30 glow-green-subtle"
          : "hover:bg-secondary/80 border border-transparent"
      )}
    >
      <MessageSquare
        className={cn(
          "w-4 h-4 flex-shrink-0",
          isActive ? "text-primary" : "text-muted-foreground"
        )}
      />
      <span
        className={cn(
          "text-sm truncate flex-1",
          isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
        )}
      >
        {chat.title}
      </span>
    </button>
  );
}
