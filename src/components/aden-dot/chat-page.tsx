'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useAppStore, useChatStore } from '@/lib/store';
import { chatService, userService, fileToBase64 } from '@/lib/supabase-service';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { t } from '@/lib/i18n';
import {
  SendIcon, CameraIcon, MicIcon, EmojiIcon,
  OnlineIcon, OfflineIcon, VerifiedIcon, DoubleCheckIcon,
  ArrowBackIcon,
} from '@/components/icons/aden-dot-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { ChatRoom, ChatMessage, User } from '@/types/skyline';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ============ Common Emojis ============
const COMMON_EMOJIS = [
  '😀', '😂', '🤣', '😍', '🥰', '😘', '😊', '🤗',
  '😎', '🤩', '🥳', '😏', '🤔', '😴', '😱', '🤯',
  '👍', '👎', '❤️', '🔥', '💯', '✨', '🌟', '💫',
  '🙏', '👏', '🙌', '💪', '🤝', '✌️', '🫶', '👋',
  '🎉', '🎊', '🎁', '🎂', '☕', '🍕', '🎵', '📷',
];

// ============ Time Formatting ============
function timeAgo(ts: number, lang: 'ar' | 'en'): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return lang === 'ar' ? 'الآن' : 'now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}${lang === 'ar' ? 'د' : 'm'}`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}${lang === 'ar' ? 'س' : 'h'}`;
  return `${Math.floor(diff / 86400000)}${lang === 'ar' ? 'ي' : 'd'}`;
}

function formatMessageTime(ts: number, lang: 'ar' | 'en'): string {
  return new Date(ts).toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateSeparator(ts: number, lang: 'ar' | 'en'): string {
  const now = new Date();
  const date = new Date(ts);
  const diff = now.getTime() - ts;

  if (diff < 86400000 && now.getDate() === date.getDate()) {
    return lang === 'ar' ? 'اليوم' : 'Today';
  }
  if (diff < 172800000 && now.getDate() - date.getDate() === 1) {
    return lang === 'ar' ? 'أمس' : 'Yesterday';
  }
  return date.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function shouldShowDateSeparator(messages: ChatMessage[], index: number): boolean {
  if (index === 0) return true;
  const prev = new Date(messages[index - 1].createdAt).setHours(0, 0, 0, 0);
  const curr = new Date(messages[index].createdAt).setHours(0, 0, 0, 0);
  return prev !== curr;
}

// ============ Chat Room Item ============
function ChatRoomItem({
  room,
  onClick,
  lang,
}: {
  room: ChatRoom;
  onClick: () => void;
  lang: 'ar' | 'en';
}) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors bg-card hover:bg-primary/5"
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="w-12 h-12">
          <AvatarImage src={room.otherUser.profileImage} alt={room.otherUser.nickname} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {room.otherUser.nickname?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="absolute bottom-0 right-0">
          {room.otherUser.status === 'online' ? (
            <OnlineIcon size={12} />
          ) : (
            <OfflineIcon size={12} />
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0 text-left" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-foreground truncate">
            {room.otherUser.nickname || room.otherUser.username}
          </span>
          {room.otherUser.isVerified && <VerifiedIcon size={12} />}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {room.lastMessage || (lang === 'ar' ? 'لا توجد رسائل' : 'No messages yet')}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-[10px] text-muted-foreground">
          {timeAgo(room.lastMessageTime, lang)}
        </span>
        {room.unreadCount > 0 && (
          <div className="w-5 h-5 rounded-full flex items-center justify-center bg-primary">
            <span className="text-[10px] font-bold text-primary-foreground">
              {room.unreadCount > 99 ? '99+' : room.unreadCount}
            </span>
          </div>
        )}
      </div>
    </motion.button>
  );
}

// ============ Emoji Picker ============
function EmojiPicker({
  onSelect,
  lang,
}: {
  onSelect: (emoji: string) => void;
  lang: 'ar' | 'en';
}) {
  return (
    <div className="bg-popover border border-border rounded-xl p-2 shadow-lg">
      <p className="text-[10px] text-muted-foreground mb-1.5 px-1">
        {lang === 'ar' ? 'رموز تعبيرية' : 'Emojis'}
      </p>
      <div className="grid grid-cols-8 gap-0.5 max-h-40 overflow-y-auto">
        {COMMON_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-primary/10 transition-colors text-base"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============ New Chat Dialog ============
function NewChatDialog({
  open,
  onOpenChange,
  onSelectUser,
  lang,
  currentUserId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectUser: (user: User) => void;
  lang: 'ar' | 'en';
  currentUserId: string;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (searchTimeout.current) clearTimeout(searchTimeout.current);

      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      searchTimeout.current = setTimeout(async () => {
        try {
          const users = await userService.searchUsers(query);
          setSearchResults(users.filter((u) => u.uid !== currentUserId));
        } catch {
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 400);
    },
    [currentUserId]
  );

  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {t('chat.newChat', lang)}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={lang === 'ar' ? 'ابحث عن مستخدم...' : 'Search for a user...'}
            className="w-full"
          />
          <div className="max-h-64 overflow-y-auto space-y-1">
            {isSearching && (
              <div className="flex items-center justify-center py-6">
                <motion.div
                  className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                />
              </div>
            )}
            {!isSearching && searchQuery && searchResults.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-6">
                {t('app.noResults', lang)}
              </p>
            )}
            {searchResults.map((user) => (
              <button
                key={user.uid}
                onClick={() => {
                  onSelectUser(user);
                  onOpenChange(false);
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-primary/5 transition-colors"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.profileImage} alt={user.nickname} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user.nickname?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-foreground truncate">
                      {user.nickname || user.username}
                    </span>
                    {user.isVerified && <VerifiedIcon size={12} />}
                  </div>
                  <span className="text-xs text-muted-foreground">@{user.username}</span>
                </div>
                <div className="flex-shrink-0">
                  {user.status === 'online' ? <OnlineIcon size={10} /> : <OfflineIcon size={10} />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============ Message Actions Sheet ============
function MessageActionsSheet({
  open,
  onOpenChange,
  message,
  isOwn,
  onReply,
  onForward,
  onDelete,
  lang,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: ChatMessage | null;
  isOwn: boolean;
  onReply: (msg: ChatMessage) => void;
  onForward: (msg: ChatMessage) => void;
  onDelete: (msg: ChatMessage) => void;
  lang: 'ar' | 'en';
}) {
  if (!message) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <SheetHeader>
          <SheetTitle className="text-sm text-muted-foreground">
            {lang === 'ar' ? 'خيارات الرسالة' : 'Message options'}
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-1 py-3">
          <button
            onClick={() => {
              onReply(message);
              onOpenChange(false);
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors"
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-4l-7 7v-7z" />
            </svg>
            <span className="text-sm text-foreground">{lang === 'ar' ? 'رد' : 'Reply'}</span>
          </button>
          <button
            onClick={() => {
              onForward(message);
              onOpenChange(false);
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors"
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            <span className="text-sm text-foreground">{lang === 'ar' ? 'إعادة توجيه' : 'Forward'}</span>
          </button>
          {isOwn && (
            <button
              onClick={() => {
                onDelete(message);
                onOpenChange(false);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/10 transition-colors"
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.8">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
              </svg>
              <span className="text-sm text-destructive">{lang === 'ar' ? 'حذف' : 'Delete'}</span>
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ============ Forward Dialog ============
function ForwardDialog({
  open,
  onOpenChange,
  rooms,
  onForwardTo,
  lang,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rooms: ChatRoom[];
  onForwardTo: (room: ChatRoom) => void;
  lang: 'ar' | 'en';
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {lang === 'ar' ? 'إعادة توجيه إلى' : 'Forward to'}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-64 overflow-y-auto space-y-1">
          {rooms.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">
              {t('chat.noChats', lang)}
            </p>
          ) : (
            rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => {
                  onForwardTo(room);
                  onOpenChange(false);
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-primary/5 transition-colors"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={room.otherUser.profileImage} alt={room.otherUser.nickname} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {room.otherUser.nickname?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground truncate">
                  {room.otherUser.nickname || room.otherUser.username}
                </span>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============ Chat Messages View ============
function ChatMessages({
  room,
  onBack,
}: {
  room: ChatRoom;
  onBack: () => void;
}) {
  const lang = useAppStore((s) => s.language);
  const user = useAuthStore((s) => s.user);
  const chatStore = useChatStore();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [forwardMessage, setForwardMessage] = useState<ChatMessage | null>(null);
  const [showForward, setShowForward] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const presenceChannelRef = useRef<RealtimeChannel | null>(null);

  // Load messages on mount
  useEffect(() => {
    let cancelled = false;

    async function loadMessages() {
      if (!room.id) return;
      setIsLoadingMessages(true);
      try {
        const msgs = await chatService.getMessages(room.id);
        if (!cancelled) {
          setMessages(msgs);
        }
        // Mark as read
        if (user) {
          await chatService.markMessagesAsRead(room.id, user.uid);
        }
      } catch (error) {
        console.error('[ChatMessages] loadMessages error:', error);
      } finally {
        if (!cancelled) setIsLoadingMessages(false);
      }
    }

    loadMessages();
    return () => {
      cancelled = true;
    };
  }, [room.id, user]);

  // Subscribe to Realtime messages
  useEffect(() => {
    if (!room.id) return;

    const supabase = getSupabaseBrowser();
    if (!supabase) return;

    // Subscribe to new messages in this room
    const channel = chatService.subscribeToMessages(room.id, (newMsg: ChatMessage) => {
      setMessages((prev) => {
        // Avoid duplicates (from optimistic update or Realtime)
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      // Mark as read if message is from other user
      if (user && newMsg.senderUID !== user.uid) {
        chatService.markMessagesAsRead(room.id, user.uid);
      }
    });

    if (channel) {
      channelRef.current = channel;
    }

    // Presence channel for typing indicator
    const presenceChannel = supabase.channel(`presence:${room.id}`, {
      config: { presence: { key: user?.uid || 'anonymous' } },
    });

    presenceChannel.on('presence', { event: 'sync' }, () => {
      const state = presenceChannel.presenceState();
      const otherUserPresence = Object.keys(state).filter(
        (key) => key !== user?.uid && key !== 'anonymous'
      );
      // If other user is present, they could be typing
      // A more sophisticated approach would track typing state
      setIsTyping(otherUserPresence.length > 0);
    });

    presenceChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED' && user) {
        await presenceChannel.track({
          user: user.uid,
          online_at: Date.now(),
        });
      }
    });

    presenceChannelRef.current = presenceChannel;

    return () => {
      if (channelRef.current) {
        chatService.unsubscribeFromRoom(channelRef.current);
        channelRef.current = null;
      }
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
        presenceChannelRef.current = null;
      }
    };
  }, [room.id, user]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send text message
  const handleSend = useCallback(async () => {
    if (!message.trim() || !user || isSending) return;

    const content = message.trim();
    setMessage('');
    setShowEmoji(false);

    // Optimistic add
    const optimisticMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      senderUID: user.uid,
      receiverUID: room.otherUser.uid,
      content,
      messageType: 'text',
      isRead: false,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    setIsSending(true);
    try {
      const sent = await chatService.sendMessage({
        roomId: room.id,
        senderUID: user.uid,
        content,
        messageType: 'text',
      });

      if (sent) {
        // Replace optimistic message with real one
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? sent : m))
        );
      } else {
        // Mark as failed
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticMsg.id
              ? { ...m, content: m.content + ' ❌' }
              : m
          )
        );
      }
    } catch (error) {
      console.error('[ChatMessages] send error:', error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimisticMsg.id
            ? { ...m, content: m.content + ' ❌' }
            : m
        )
      );
    } finally {
      setIsSending(false);
    }

    // Refresh rooms
    chatStore.fetchChatRooms();
  }, [message, user, isSending, room, chatStore]);

  // Send image message
  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !user) return;

      try {
        const base64 = await fileToBase64(file);
        const optimisticMsg: ChatMessage = {
          id: `temp_${Date.now()}`,
          senderUID: user.uid,
          receiverUID: room.otherUser.uid,
          content: '📷',
          mediaBase64: base64,
          mediaMimeType: file.type,
          messageType: 'image',
          isRead: false,
          createdAt: Date.now(),
        };
        setMessages((prev) => [...prev, optimisticMsg]);

        const sent = await chatService.sendMessage({
          roomId: room.id,
          senderUID: user.uid,
          content: '',
          mediaBase64: base64,
          mediaMimeType: file.type,
          messageType: 'image',
        });

        if (sent) {
          setMessages((prev) =>
            prev.map((m) => (m.id === optimisticMsg.id ? sent : m))
          );
        }
      } catch (error) {
        console.error('[ChatMessages] image upload error:', error);
      }

      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
      chatStore.fetchChatRooms();
    },
    [user, room, chatStore]
  );

  // Delete message
  const handleDeleteMessage = useCallback(
    async (msg: ChatMessage) => {
      if (!user) return;

      // Optimistic remove
      setMessages((prev) => prev.filter((m) => m.id !== msg.id));

      try {
        const supabase = getSupabaseBrowser();
        if (supabase) {
          await supabase.from('chat_messages').delete().eq('id', msg.id);
        }
      } catch (error) {
        console.error('[ChatMessages] delete error:', error);
        // Re-add on failure
        setMessages((prev) => [...prev, msg].sort((a, b) => a.createdAt - b.createdAt));
      }
    },
    [user]
  );

  // Forward message
  const handleForwardTo = useCallback(
    async (targetRoom: ChatRoom) => {
      if (!forwardMessage || !user) return;

      try {
        await chatService.sendMessage({
          roomId: targetRoom.id,
          senderUID: user.uid,
          content: forwardMessage.content,
          messageType: forwardMessage.messageType,
          mediaBase64: forwardMessage.mediaBase64,
          mediaMimeType: forwardMessage.mediaMimeType,
        });
        chatStore.fetchChatRooms();
      } catch (error) {
        console.error('[ChatMessages] forward error:', error);
      }

      setForwardMessage(null);
    },
    [forwardMessage, user, chatStore]
  );

  // Reply with quote
  const handleReply = useCallback((msg: ChatMessage) => {
    setReplyTo(msg);
  }, []);

  // Insert emoji
  const handleEmojiSelect = useCallback((emoji: string) => {
    setMessage((prev) => prev + emoji);
  }, []);

  // Toggle voice recording (UI only)
  const handleVoiceRecord = useCallback(() => {
    setIsRecording((prev) => !prev);
    if (!isRecording) {
      // Start recording UI
      setTimeout(() => {
        setIsRecording(false);
      }, 5000);
    }
  }, [isRecording]);

  // Filtered messages for search
  const filteredMessages = searchQuery
    ? messages.filter((m) =>
        m.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  const isMe = (uid: string) => uid === user?.uid;

  return (
    <div className="flex flex-col h-[calc(100vh-60px)]">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-border bg-card/80 backdrop-blur-sm">
        <button onClick={onBack} className="flex-shrink-0">
          <ArrowBackIcon size={22} color="var(--primary)" />
        </button>
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage src={room.otherUser.profileImage} alt={room.otherUser.nickname} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {room.otherUser.nickname?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-foreground truncate">
              {room.otherUser.nickname || room.otherUser.username}
            </span>
            {room.otherUser.isVerified && <VerifiedIcon size={12} />}
          </div>
          <div className="flex items-center gap-1">
            {room.otherUser.status === 'online' ? (
              <OnlineIcon size={8} />
            ) : (
              <OfflineIcon size={8} />
            )}
            <span className="text-[10px] text-muted-foreground">
              {room.otherUser.status === 'online'
                ? t('chat.online', lang)
                : `${t('chat.lastSeen', lang)} ${timeAgo(room.otherUser.lastSeen, lang)}`}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="p-2 flex-shrink-0"
        >
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--muted-foreground)"
            strokeWidth="1.8"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </button>
      </div>

      {/* Search bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border"
          >
            <div className="p-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'ar' ? 'ابحث في الرسائل...' : 'Search messages...'}
                className="w-full h-9 text-sm"
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-1"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        {isLoadingMessages ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
            />
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center bg-primary/10">
              <svg
                width={32}
                height={32}
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="1.5"
              >
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? lang === 'ar'
                  ? 'لا توجد نتائج'
                  : 'No results found'
                : lang === 'ar'
                ? 'ابدأ المحادثة'
                : 'Start the conversation'}
            </p>
          </div>
        ) : (
          filteredMessages.map((msg, idx) => {
            const mine = isMe(msg.senderUID);
            const showDate = shouldShowDateSeparator(filteredMessages, idx);

            return (
              <React.Fragment key={msg.id}>
                {showDate && (
                  <div className="flex items-center justify-center my-3">
                    <span className="text-[10px] text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                      {formatDateSeparator(msg.createdAt, lang)}
                    </span>
                  </div>
                )}
                <motion.div
                  className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => {
                    setSelectedMessage(msg);
                    setShowActions(true);
                  }}
                >
                  <div
                    className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl ${
                      mine
                        ? 'rounded-br-md bg-primary text-primary-foreground'
                        : 'rounded-bl-md bg-muted text-foreground'
                    }`}
                  >
                    {/* Reply preview */}
                    {msg.content.startsWith('↪') && (
                      <div
                        className={`text-[11px] mb-1.5 px-2 py-1 rounded-md border-l-2 ${
                          mine
                            ? 'border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground/70'
                            : 'border-primary/40 bg-primary/5 text-muted-foreground'
                        }`}
                      >
                        {msg.content.split('\n')[0]}
                      </div>
                    )}

                    {/* Image message */}
                    {msg.messageType === 'image' && msg.mediaBase64 && (
                      <div className="mb-1.5">
                        <img
                          src={msg.mediaBase64}
                          alt="Sent image"
                          className="max-w-full max-h-48 rounded-lg object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Text content */}
                    {msg.content && msg.messageType !== 'image' && (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    )}

                    {/* Timestamp & status */}
                    <div
                      className={`flex items-center gap-1 mt-1 ${
                        mine ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <span
                        className={`text-[9px] ${
                          mine
                            ? 'text-primary-foreground/60'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {formatMessageTime(msg.createdAt, lang)}
                      </span>
                      {mine && (
                        <DoubleCheckIcon
                          size={12}
                          color={
                            msg.isRead
                              ? '#3B82F6'
                              : 'var(--muted-foreground)'
                          }
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              </React.Fragment>
            );
          })
        )}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
            >
              <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-muted">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary"
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.6,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Reply bar */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border"
          >
            <div
              className="flex items-center gap-2 p-2 bg-muted/50"
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
            >
              <div className="flex-1 min-w-0 border-l-2 border-primary pl-2">
                <p className="text-[10px] text-primary font-medium">
                  {isMe(replyTo.senderUID)
                    ? lang === 'ar'
                      ? 'أنت'
                      : 'You'
                    : room.otherUser.nickname}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {replyTo.messageType === 'image'
                    ? '📷'
                    : replyTo.content.substring(0, 50)}
                </p>
              </div>
              <button
                onClick={() => setReplyTo(null)}
                className="p-1 flex-shrink-0"
              >
                <svg
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--muted-foreground)"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji picker */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="p-2">
              <EmojiPicker onSelect={handleEmojiSelect} lang={lang} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice recording indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="flex items-center gap-3 p-3 bg-destructive/5">
              <motion.div
                className="w-3 h-3 rounded-full bg-destructive"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
              <span className="text-sm text-destructive font-medium">
                {lang === 'ar' ? 'جاري التسجيل...' : 'Recording...'}
              </span>
              <span className="text-xs text-muted-foreground">
                {lang === 'ar' ? '(وضع تجريبي)' : '(Demo mode)'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div
        className="p-3 flex items-center gap-2 border-t border-border bg-card/80 backdrop-blur-sm"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          className="p-2 flex-shrink-0"
        >
          <EmojiIcon
            size={22}
            color={showEmoji ? 'var(--primary)' : 'var(--muted-foreground)'}
          />
        </button>

        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={t('chat.typeMessage', lang)}
          className="flex-1 h-10 rounded-full bg-muted border-border text-foreground placeholder:text-muted-foreground text-sm"
          style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 flex-shrink-0"
        >
          <CameraIcon size={22} color="var(--muted-foreground)" />
        </button>

        <button
          onClick={handleVoiceRecord}
          className={`p-2 flex-shrink-0 ${isRecording ? 'text-destructive' : ''}`}
        >
          <MicIcon
            size={22}
            color={isRecording ? '#EF4444' : 'var(--muted-foreground)'}
          />
        </button>

        <motion.button
          onClick={handleSend}
          className={`p-2 rounded-full flex-shrink-0 ${
            message.trim() ? 'bg-primary' : 'bg-transparent'
          }`}
          whileTap={{ scale: 0.9 }}
          disabled={!message.trim() || isSending}
        >
          <SendIcon
            size={20}
            color={
              message.trim()
                ? 'var(--primary-foreground)'
                : 'var(--muted-foreground)'
            }
          />
        </motion.button>
      </div>

      {/* Message Actions Sheet */}
      <MessageActionsSheet
        open={showActions}
        onOpenChange={setShowActions}
        message={selectedMessage}
        isOwn={!!selectedMessage && isMe(selectedMessage.senderUID)}
        onReply={handleReply}
        onForward={(msg) => {
          setForwardMessage(msg);
          setShowForward(true);
        }}
        onDelete={handleDeleteMessage}
        lang={lang}
      />

      {/* Forward Dialog */}
      <ForwardDialog
        open={showForward}
        onOpenChange={setShowForward}
        rooms={chatStore.chatRooms.filter((r) => r.id !== room.id)}
        onForwardTo={handleForwardTo}
        lang={lang}
      />
    </div>
  );
}

// ============ Chat Room List ============
function ChatRoomList({
  onOpenRoom,
  onNewChat,
  lang,
}: {
  onOpenRoom: (room: ChatRoom) => void;
  onNewChat: () => void;
  lang: 'ar' | 'en';
}) {
  const chatStore = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load rooms on mount
  useEffect(() => {
    chatStore.fetchChatRooms();
  }, []);

  // Subscribe to room list changes
  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase || !chatStore.chatRooms.length) return;

    const channel = supabase
      .channel('chat_rooms_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms',
        },
        () => {
          chatStore.fetchChatRooms();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
        },
        () => {
          chatStore.fetchChatRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await chatStore.fetchChatRooms();
    setIsRefreshing(false);
  };

  const filteredRooms = searchQuery
    ? chatStore.chatRooms.filter(
        (r) =>
          r.otherUser.nickname
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          r.otherUser.username
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          r.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : chatStore.chatRooms;

  return (
    <div className="space-y-3" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header with search and new chat */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('chat.searchChats', lang)}
            className="h-9 rounded-full bg-muted border-border text-sm"
          />
        </div>
        <motion.button
          onClick={onNewChat}
          className="p-2 rounded-full bg-primary flex-shrink-0"
          whileTap={{ scale: 0.9 }}
        >
          <svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--primary-foreground)"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </motion.button>
      </div>

      {/* Loading */}
      {chatStore.isLoading && chatStore.chatRooms.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <motion.div
            className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
          />
        </div>
      )}

      {/* Error */}
      {chatStore.error && (
        <div className="text-center py-6">
          <p className="text-sm text-destructive mb-2">{chatStore.error}</p>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            {t('app.retry', lang)}
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!chatStore.isLoading && !chatStore.error && filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center bg-primary/10">
            <svg
              width={32}
              height={32}
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="1.5"
            >
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {searchQuery
              ? t('app.noResults', lang)
              : t('chat.noChats', lang)}
          </p>
          {!searchQuery && (
            <Button variant="outline" size="sm" onClick={onNewChat}>
              {t('chat.startChat', lang)}
            </Button>
          )}
        </div>
      )}

      {/* Room list */}
      <div className="space-y-1">
        {filteredRooms.map((room, idx) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
          >
            <ChatRoomItem
              room={room}
              onClick={() => onOpenRoom(room)}
              lang={lang}
            />
          </motion.div>
        ))}
      </div>

      {/* Pull to refresh indicator */}
      {isRefreshing && (
        <div className="flex justify-center py-2">
          <motion.div
            className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
          />
        </div>
      )}
    </div>
  );
}

// ============ Chat Page (Main Export) ============
export function ChatPage() {
  const lang = useAppStore((s) => s.language);
  const user = useAuthStore((s) => s.user);
  const chatStore = useChatStore();
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [newChatOpen, setNewChatOpen] = useState(false);

  // Handle selecting a user from New Chat dialog
  const handleSelectUser = useCallback(
    async (otherUser: User) => {
      if (!user) return;

      // Check if room already exists
      const existingRoom = chatStore.chatRooms.find(
        (r) => r.otherUser.uid === otherUser.uid
      );

      if (existingRoom) {
        setSelectedRoom(existingRoom);
        return;
      }

      // Create new room
      try {
        const roomId = await chatService.createOrGetChatRoom(
          user.uid,
          otherUser.uid
        );
        if (roomId) {
          // Create a ChatRoom object for the new room
          const newRoom: ChatRoom = {
            id: roomId,
            participants: [user.uid, otherUser.uid],
            lastMessage: '',
            lastMessageTime: Date.now(),
            unreadCount: 0,
            otherUser,
          };
          setSelectedRoom(newRoom);
          chatStore.fetchChatRooms();
        }
      } catch (error) {
        console.error('[ChatPage] createOrGetChatRoom error:', error);
      }
    },
    [user, chatStore]
  );

  if (selectedRoom) {
    return (
      <ChatMessages
        room={selectedRoom}
        onBack={() => setSelectedRoom(null)}
      />
    );
  }

  return (
    <>
      <ChatRoomList
        onOpenRoom={setSelectedRoom}
        onNewChat={() => setNewChatOpen(true)}
        lang={lang}
      />
      <NewChatDialog
        open={newChatOpen}
        onOpenChange={setNewChatOpen}
        onSelectUser={handleSelectUser}
        lang={lang}
        currentUserId={user?.uid || ''}
      />
    </>
  );
}
