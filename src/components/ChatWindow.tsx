'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Send, ArrowLeft, Shield } from 'lucide-react';

interface ChatWindowProps {
  enquiryId: string;
  currentUser: { id: string; name: string; role: string };
  onBack?: () => void;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

export default function ChatWindow({ enquiryId, currentUser, onBack }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [enquiry, setEnquiry] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`/api/chat/${enquiryId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setEnquiry(data.enquiry);
      }
    } catch (e) {
      console.error('Error fetching chat messages:', e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Poll for new messages every 3 seconds
  useEffect(() => {
    fetchMessages(true);

    const interval = setInterval(() => {
      fetchMessages(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [enquiryId]);

  // Scroll to bottom when messages list changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/chat/${enquiryId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage('');
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to send message.');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Network error sending message.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-emerald-400 h-96 bg-[#0e1424] rounded-2xl border border-slate-800">
        <RefreshCw className="animate-spin" size={24} />
        <span className="text-xs font-semibold mt-2 text-slate-400">Loading conversation...</span>
      </div>
    );
  }

  return (
    <div className="bg-[#0e1424] rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[calc(100vh-16rem)] text-slate-100">
      {/* Chat header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3.5 bg-slate-900/90 flex-shrink-0">
        {onBack && (
          <button onClick={onBack} className="text-slate-400 hover:text-white focus:outline-none">
            <ArrowLeft size={18} />
          </button>
        )}
        <div>
          <h3 className="font-extrabold text-white text-sm">
            {currentUser.role === 'SEEKER' ? 'Contacting Property Manager' : 'Replying Seeker'}
          </h3>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Enquiry Thread ID: {enquiryId.slice(0, 8)}...
          </p>
        </div>
      </div>

      {/* Messages body */}
      <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-[#090d16]/80">
        <div className="text-center">
          <span className="inline-flex items-center justify-center gap-1.5 bg-slate-900 text-slate-400 py-1 px-3.5 rounded-full text-[10px] font-bold border border-slate-800 uppercase max-w-[280px] mx-auto">
            <Shield size={11} className="text-emerald-400" /> Direct In-App Chat
          </span>
        </div>

        {messages.map((msg) => {
          const isOwnMessage = msg.senderId === currentUser.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-md ${
                  isOwnMessage
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <p className="leading-relaxed font-medium break-words">{msg.content}</p>
                <span className={`block text-[9px] mt-1 text-right font-semibold ${
                  isOwnMessage ? 'text-emerald-200' : 'text-slate-500'
                }`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat footer input */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex-shrink-0">
        {errorMsg && <p className="text-rose-400 text-xs mb-2 font-medium">{errorMsg}</p>}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            required
            disabled={sending}
            placeholder="Type your message here..."
            className="flex-grow px-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold p-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/20 focus:outline-none flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
