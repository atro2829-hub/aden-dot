'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useAppStore } from '@/lib/store';
import { t, formatNumber } from '@/lib/i18n';
import {
  SendIcon, CameraIcon, ImageIcon, MicIcon, EmojiIcon,
  OnlineIcon, OfflineIcon, VerifiedIcon, DoubleCheckIcon,
} from '@/components/icons/aden-dot-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import type { ChatRoom, ChatMessage } from '@/types/skyline';

// ============ Demo Chat Data ============
const demoRooms: (ChatRoom & { lastSeen?: string })[] = [
  {
    id: '1',
    participants: ['me', '1'],
    lastMessage: 'أهلاً! كيف حالك؟ 👋',
    lastMessageTime: Date.now() - 300000,
    unreadCount: 2,
    otherUser: { uid: '1', email: '', username: 'ahmed', nickname: 'أحمد العلي', bio: '', gender: 'male', profileImage: '', coverImage: '', status: 'online', role: 'user', isVerified: true, isPremium: false, region: '', followersCount: 500, followingCount: 200, postsCount: 30, level: 15, xp: 5000, popularity: 2000, giftsCount: 10, subscribers: 50, coinsBalance: 1000, diamondsBalance: 50, isProfileComplete: true, isEmailVerified: true, joinDate: '', lastSeen: Date.now() },
    lastSeen: 'online',
  },
  {
    id: '2',
    participants: ['me', '2'],
    lastMessage: 'شكراً لك! 🙏',
    lastMessageTime: Date.now() - 3600000,
    unreadCount: 0,
    otherUser: { uid: '2', email: '', username: 'sara', nickname: 'سارة الأحمد', bio: '', gender: 'female', profileImage: '', coverImage: '', status: 'offline', role: 'user', isVerified: false, isPremium: true, region: '', followersCount: 1200, followingCount: 300, postsCount: 45, level: 22, xp: 12000, popularity: 5000, giftsCount: 25, subscribers: 120, coinsBalance: 3000, diamondsBalance: 200, isProfileComplete: true, isEmailVerified: true, joinDate: '', lastSeen: Date.now() - 3600000 },
    lastSeen: '2h',
  },
  {
    id: '3',
    participants: ['me', '3'],
    lastMessage: 'هل شاهدت البث المباشر؟ 🎥',
    lastMessageTime: Date.now() - 86400000,
    unreadCount: 1,
    otherUser: { uid: '3', email: '', username: 'khaled', nickname: 'خالد المحمدي', bio: '', gender: 'male', profileImage: '', coverImage: '', status: 'online', role: 'user', isVerified: true, isPremium: true, region: '', followersCount: 8000, followingCount: 150, postsCount: 120, level: 45, xp: 35000, popularity: 15000, giftsCount: 100, subscribers: 500, coinsBalance: 10000, diamondsBalance: 1000, isProfileComplete: true, isEmailVerified: true, joinDate: '', lastSeen: Date.now() },
    lastSeen: 'online',
  },
];

const demoMessages: ChatMessage[] = [
  { id: '1', senderUID: '1', receiverUID: 'me', content: 'مرحباً! 👋', messageType: 'text', isRead: true, createdAt: Date.now() - 600000 },
  { id: '2', senderUID: 'me', receiverUID: '1', content: 'أهلاً أحمد! كيف حالك؟', messageType: 'text', isRead: true, createdAt: Date.now() - 500000 },
  { id: '3', senderUID: '1', receiverUID: 'me', content: 'الحمد لله بخير! هل جربت التطبيق الجديد؟ 🌟', messageType: 'text', isRead: true, createdAt: Date.now() - 400000 },
  { id: '4', senderUID: 'me', receiverUID: '1', content: 'نعم! عدن دوت رائع جداً 💫', messageType: 'text', isRead: true, createdAt: Date.now() - 300000 },
  { id: '5', senderUID: '1', receiverUID: 'me', content: 'أهلاً! كيف حالك؟ 👋', messageType: 'text', isRead: false, createdAt: Date.now() - 300000 },
];

// ============ Chat Room Item ============
function ChatRoomItem({ room, onClick, lang }: { room: ChatRoom & { lastSeen?: string }; onClick: () => void; lang: 'ar' | 'en' }) {
  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return lang === 'ar' ? 'الآن' : 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}${lang === 'ar' ? 'د' : 'm'}`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}${lang === 'ar' ? 'س' : 'h'}`;
    return `${Math.floor(diff / 86400000)}${lang === 'ar' ? 'ي' : 'd'}`;
  };

  return (
    <motion.button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors bg-card hover:bg-primary/5"
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative">
        <Avatar className="w-12 h-12">
          <AvatarFallback className="bg-primary/10 text-primary">{room.otherUser.nickname?.charAt(0) || '?'}</AvatarFallback>
        </Avatar>
        <div className="absolute bottom-0 right-0">
          {room.otherUser.status === 'online' ? <OnlineIcon size={12} /> : <OfflineIcon size={12} />}
        </div>
      </div>
      <div className="flex-1 min-w-0 text-left" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-foreground truncate">{room.otherUser.nickname}</span>
          {room.otherUser.isVerified && <VerifiedIcon size={12} />}
        </div>
        <p className="text-xs text-muted-foreground truncate">{room.lastMessage}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-[10px] text-muted-foreground">{timeAgo(room.lastMessageTime)}</span>
        {room.unreadCount > 0 && (
          <div className="w-5 h-5 rounded-full flex items-center justify-center bg-primary">
            <span className="text-[10px] font-bold text-primary-foreground">{room.unreadCount}</span>
          </div>
        )}
      </div>
    </motion.button>
  );
}

// ============ Chat Messages View ============
function ChatMessages({ room, onBack }: { room: ChatRoom & { lastSeen?: string }; onBack: () => void }) {
  const lang = useAppStore((s) => s.language);
  const user = useAuthStore((s) => s.user);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(demoMessages);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!message.trim()) return;
    const newMsg: ChatMessage = {
      id: String(Date.now()),
      senderUID: 'me',
      receiverUID: room.otherUser.uid,
      content: message,
      messageType: 'text',
      isRead: false,
      createdAt: Date.now(),
    };
    setMessages([...messages, newMsg]);
    setMessage('');

    // Simulate typing response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const reply: ChatMessage = {
        id: String(Date.now() + 1),
        senderUID: room.otherUser.uid,
        receiverUID: 'me',
        content: lang === 'ar' ? 'شكراً لرسالتك! 😊' : 'Thanks for your message! 😊',
        messageType: 'text',
        isRead: false,
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, reply]);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-60px)]">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-border">
        <button onClick={onBack}>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-primary/10 text-primary">{room.otherUser.nickname?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-foreground">{room.otherUser.nickname}</span>
            {room.otherUser.isVerified && <VerifiedIcon size={12} />}
          </div>
          <div className="flex items-center gap-1">
            {room.otherUser.status === 'online' ? <OnlineIcon size={8} /> : <OfflineIcon size={8} />}
            <span className="text-[10px] text-muted-foreground">
              {room.otherUser.status === 'online' ? t('chat.online', lang) : t('chat.lastSeen', lang)}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {messages.map((msg, idx) => {
          const isMe = msg.senderUID === 'me';
          return (
            <motion.div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: idx * 0.02 }}
            >
              <div
                className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl ${isMe ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md bg-muted text-foreground'}`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-start' : 'justify-end'}`}>
                  <span className={`text-[9px] ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isMe && (
                    <DoubleCheckIcon size={12} color={msg.isRead ? '#3B82F6' : 'var(--muted-foreground)'} />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

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
                      transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-3 flex items-center gap-2 border-t border-border">
        <button className="p-2">
          <EmojiIcon size={22} color="var(--muted-foreground)" />
        </button>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={t('chat.typeMessage', lang)}
          className="flex-1 h-10 rounded-full bg-muted border-border text-foreground placeholder:text-muted-foreground text-sm"
          style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
        />
        <button className="p-2">
          <CameraIcon size={22} color="var(--muted-foreground)" />
        </button>
        <motion.button
          onClick={handleSend}
          className={`p-2 rounded-full ${message.trim() ? 'bg-primary' : 'bg-transparent'}`}
          whileTap={{ scale: 0.9 }}
          disabled={!message.trim()}
        >
          <SendIcon size={20} color={message.trim() ? 'var(--primary-foreground)' : 'var(--muted-foreground)'} />
        </motion.button>
      </div>
    </div>
  );
}

// ============ Chat Page ============
export function ChatPage() {
  const lang = useAppStore((s) => s.language);
  const [selectedRoom, setSelectedRoom] = useState<(ChatRoom & { lastSeen?: string }) | null>(null);

  if (selectedRoom) {
    return <ChatMessages room={selectedRoom} onBack={() => setSelectedRoom(null)} />;
  }

  return (
    <div className="space-y-3">
      {demoRooms.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center bg-primary/10">
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">{t('chat.noChats', lang)}</p>
        </div>
      ) : (
        demoRooms.map((room, idx) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <ChatRoomItem room={room} onClick={() => setSelectedRoom(room)} lang={lang} />
          </motion.div>
        ))
      )}
    </div>
  );
}
