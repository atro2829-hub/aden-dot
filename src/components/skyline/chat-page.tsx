'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useChatStore, useAuthStore, useUsersStore, formatTimeAgo, fileToBase64 } from '@/lib/store';
import type { ChatMessage, ChatRoom } from '@/types/skyline';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Image, X, MessageCircle, UserPlus, ArrowLeft, MoreVertical, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Single chat message bubble
function ChatBubble({ message, isOwn }: { message: ChatMessage; isOwn: boolean }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[75%] ${isOwn ? 'order-2' : ''}`}>
        {message.mediaBase64 && message.mediaMimeType?.startsWith('image') && (
          <div className="rounded-xl overflow-hidden mb-1">
            <img src={message.mediaBase64} alt="Shared image" className="max-h-48 object-cover" />
          </div>
        )}
        {message.mediaBase64 && message.mediaMimeType?.startsWith('video') && (
          <div className="rounded-xl overflow-hidden mb-1">
            <video src={message.mediaBase64} controls className="max-h-48" />
          </div>
        )}
        {message.content && (
          <div className={`px-3 py-2 rounded-2xl text-sm ${isOwn ? 'bg-gradient-to-r from-violet-500 to-rose-500 text-white rounded-br-md' : 'bg-muted rounded-bl-md'}`}>
            {message.content}
          </div>
        )}
        <div className={`text-[10px] text-muted-foreground mt-0.5 ${isOwn ? 'text-right' : ''}`}>
          {formatTimeAgo(message.createdAt)}
        </div>
      </div>
    </div>
  );
}

// Chat conversation view
function ChatConversation({ otherUser, onBack }: { otherUser: { uid: string; username: string; nickname: string; profileImage: string; status: string }; onBack: () => void }) {
  const [messageText, setMessageText] = useState('');
  const [mediaBase64, setMediaBase64] = useState('');
  const [mediaMimeType, setMediaMimeType] = useState('');
  const [mediaPreview, setMediaPreview] = useState('');
  const sendMessage = useChatStore((s) => s.sendMessage);
  const activeChatMessages = useChatStore((s) => s.activeChatMessages);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChatMessages]);

  const handleSend = useCallback(async () => {
    if (!messageText.trim() && !mediaBase64) return;
    await sendMessage(otherUser.uid, messageText, mediaBase64 || undefined, mediaMimeType || undefined);
    setMessageText('');
    setMediaBase64('');
    setMediaMimeType('');
    setMediaPreview('');
  }, [messageText, mediaBase64, mediaMimeType, otherUser.uid, sendMessage]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setMediaBase64(base64);
      setMediaMimeType(file.type);
      setMediaPreview(base64);
    } catch {
      toast.error('Failed to process file');
    }
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Chat header */}
      <div className="flex items-center gap-3 p-3 border-b bg-background">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="w-9 h-9">
          <AvatarImage src={otherUser.profileImage || '/avatar.png'} />
          <AvatarFallback>{otherUser.nickname?.charAt(0) || '?'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold text-sm">{otherUser.nickname || otherUser.username}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${otherUser.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`} />
            {otherUser.status === 'online' ? 'online' : 'offline'}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        {activeChatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No messages yet</p>
            <p className="text-xs text-muted-foreground">Start the conversation!</p>
          </div>
        ) : (
          activeChatMessages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} isOwn={msg.senderUID === useAuthStore.getState().user?.uid} />
          ))
        )}
      </ScrollArea>

      {/* Media preview */}
      {mediaPreview && (
        <div className="px-3 pb-2">
          <div className="relative inline-block">
            {mediaMimeType.startsWith('image') ? (
              <img src={mediaPreview} alt="Preview" className="h-20 rounded-lg object-cover" />
            ) : (
              <video src={mediaPreview} className="h-20 rounded-lg" />
            )}
            <button onClick={() => { setMediaBase64(''); setMediaPreview(''); setMediaMimeType(''); }} className="absolute -top-2 -right-2 bg-black/50 text-white rounded-full p-0.5">
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-center gap-2 p-3 border-t bg-background">
        <label className="cursor-pointer">
          <Image className="h-5 w-5 text-muted-foreground hover:text-violet-500 transition-colors" />
          <input type="file" accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />
        </label>
        <Input placeholder="Type a message..." value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} className="flex-1" />
        <Button size="icon" className="h-9 w-9 bg-gradient-to-r from-violet-500 to-rose-500" onClick={handleSend} disabled={!messageText.trim() && !mediaBase64}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Main Chat page
export function ChatPage() {
  const [activeChatUID, setActiveChatUID] = useState<string | null>(null);
  const [chatTab, setChatTab] = useState<'messages' | 'requests'>('messages');
  const users = useUsersStore((s) => s.users);
  const user = useAuthStore((s) => s.user);
  const chatRooms = useChatStore((s) => s.chatRooms);
  const fetchChatRooms = useChatStore((s) => s.fetchChatRooms);
  const setActiveChatStore = useChatStore((s) => s.setActiveChat);
  const isLoading = useChatStore((s) => s.isLoading);

  // Load chat rooms on mount
  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  // Find the other user from either chat rooms or users list
  const chatUser = activeChatUID
    ? (() => {
        // First try from chat room's otherUser
        const room = chatRooms.find(r => r.otherUser?.uid === activeChatUID);
        if (room?.otherUser) return room.otherUser;
        // Fallback to users list
        return users.find((u) => u.uid === activeChatUID);
      })()
    : null;

  const handleOpenChat = useCallback(async (uid: string) => {
    setActiveChatUID(uid);
    await setActiveChatStore(uid);
  }, [setActiveChatStore]);

  const handleBack = useCallback(() => {
    setActiveChatUID(null);
  }, []);

  if (chatUser) {
    return <ChatConversation otherUser={chatUser} onBack={handleBack} />;
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Search */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search conversations..." className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Tabs value={chatTab} onValueChange={(v) => setChatTab(v as typeof chatTab)}>
        <TabsList className="w-full">
          <TabsTrigger value="messages" className="flex-1">Messages</TabsTrigger>
          <TabsTrigger value="requests" className="flex-1">Requests</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {chatTab === 'messages' && !isLoading ? (
        chatRooms.length === 0 ? (
          // Fallback: show all other users as potential chat partners
          users.filter((u) => u.uid !== user?.uid).length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-12 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">You don&apos;t have anyone to chat with yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-1">
              {users.filter((u) => u.uid !== user?.uid).map((u) => (
                <Card key={u.uid} className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleOpenChat(u.uid)}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={u.profileImage || '/avatar.png'} />
                        <AvatarFallback>{u.nickname?.charAt(0) || '?'}</AvatarFallback>
                      </Avatar>
                      {u.status === 'online' && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-sm truncate">{u.nickname || u.username}</span>
                        {u.isVerified && <Badge className="bg-violet-100 text-violet-700 text-[10px] h-4 px-1">✓</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">Tap to start chatting</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {u.status === 'online' ? 'online' : 'offline'}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          // Show chat rooms with last message info
          <div className="space-y-1">
            {chatRooms.map((room) => (
              <Card key={room.id} className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleOpenChat(room.otherUser?.uid || '')}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={room.otherUser?.profileImage || '/avatar.png'} />
                      <AvatarFallback>{room.otherUser?.nickname?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    {room.otherUser?.status === 'online' && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-sm truncate">{room.otherUser?.nickname || room.otherUser?.username || 'User'}</span>
                      {room.otherUser?.isVerified && <Badge className="bg-violet-100 text-violet-700 text-[10px] h-4 px-1">✓</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{room.lastMessage || 'No messages yet'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {room.unreadCount > 0 && (
                      <Badge className="bg-violet-500 text-white text-[10px] h-5 min-w-5 flex items-center justify-center px-1.5">
                        {room.unreadCount}
                      </Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {room.lastMessageTime ? formatTimeAgo(room.lastMessageTime) : ''}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : chatTab === 'requests' ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <UserPlus className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No pending chat requests</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
