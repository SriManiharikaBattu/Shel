'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Send, ArrowLeft, Shield, Mic, Square, Play, Pause, Volume2, X, MapPin, ExternalLink, Building, User } from 'lucide-react';
import Link from 'next/link';

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

// Voice Note Player Component
function VoiceNoteMessage({ content, isOwn }: { content: string; isOwn: boolean }) {
  const audioSrc = content.replace('[VOICE_NOTE]:', '');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => console.error(err));
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex items-center gap-3 py-1">
      <audio ref={audioRef} src={audioSrc} preload="metadata" />
      <button
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 shadow-md ${
          isOwn
            ? 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-400/40'
            : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
        }`}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </button>

      <div className="flex flex-col gap-1 min-w-[140px] sm:min-w-[180px]">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="flex items-center gap-1">
            <Volume2 size={13} className={isOwn ? 'text-emerald-200' : 'text-emerald-400'} />
            <span>Voice Note</span>
          </span>
          <span className={`text-[10px] ${isOwn ? 'text-emerald-200' : 'text-slate-400'}`}>
            {isPlaying ? formatTime(currentTime) : (duration > 0 ? formatTime(duration) : 'Audio')}
          </span>
        </div>

        {/* Visual audio progress bar */}
        <div className="w-full bg-slate-950/60 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all ${isOwn ? 'bg-white' : 'bg-emerald-400'}`}
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function ChatWindow({ enquiryId, currentUser, onBack }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [enquiry, setEnquiry] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleSendMessage = async (textToSend?: string) => {
    const content = textToSend !== undefined ? textToSend : newMessage;
    if (!content || !content.trim() || sending) return;

    setSending(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/chat/${enquiryId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        if (textToSend === undefined) setNewMessage('');
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

  // Start voice recording
  const startRecording = async () => {
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          if (base64Audio) {
            handleSendMessage(`[VOICE_NOTE]:${base64Audio}`);
          }
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Microphone access is required to send voice notes.');
    }
  };

  // Stop & Send voice recording
  const stopRecordingAndSend = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Cancel voice recording
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatRecordingTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
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
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/95 flex-shrink-0">
        <div className="flex items-start gap-3">
          {onBack && (
            <button onClick={onBack} className="text-slate-400 hover:text-white focus:outline-none mt-1">
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-white text-base leading-tight">
                {enquiry?.property?.name || (currentUser.role === 'SEEKER' ? 'Hostel Owner Chat' : 'Customer Chat')}
              </h3>
              {enquiry?.property?.id && (
                <Link
                  href={`/seeker/properties/${enquiry.property.id}`}
                  className="text-slate-400 hover:text-emerald-400 inline-flex items-center transition-colors"
                  title="View property details"
                >
                  <ExternalLink size={13} />
                </Link>
              )}
            </div>

            {enquiry?.property?.city && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <MapPin size={12} className="flex-shrink-0" />
                <span>
                  {enquiry.property.city}{enquiry.property.state ? `, ${enquiry.property.state}` : ''}
                </span>
              </div>
            )}

            <p className="text-slate-400 text-[11px] font-medium">
              {currentUser.role === 'SEEKER'
                ? `Owner: ${enquiry?.property?.owner?.name || 'Property Manager'}`
                : `Customer: ${enquiry?.seeker?.name || 'Prospective Resident'} (${enquiry?.seeker?.phone || 'Direct'})`}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 bg-slate-950 text-emerald-400 py-1.5 px-3.5 rounded-full text-xs font-bold border border-emerald-800/60 shadow-sm self-start sm:self-center">
          <Shield size={13} className="text-emerald-400" /> Live In-App Chat
        </span>
      </div>

      {/* Messages body */}
      <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-[#090d16]/80">
        {messages.map((msg) => {
          const isOwnMessage = msg.senderId === currentUser.id;
          const isVoiceNote = msg.content.startsWith('[VOICE_NOTE]:');

          return (
            <div
              key={msg.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-md ${
                  isOwnMessage
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {isVoiceNote ? (
                  <VoiceNoteMessage content={msg.content} isOwn={isOwnMessage} />
                ) : (
                  <p className="leading-relaxed font-medium break-words text-sm">{msg.content}</p>
                )}

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

      {/* Chat footer input with Voice Note Recorder */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex-shrink-0">
        {errorMsg && <p className="text-rose-400 text-xs mb-2 font-medium">{errorMsg}</p>}

        {isRecording ? (
          <div className="flex items-center justify-between gap-3 bg-slate-950 p-2 rounded-xl border border-rose-800/80 animate-pulse">
            <div className="flex items-center gap-2 pl-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-bold text-rose-400">Recording Voice Note...</span>
              <span className="text-xs font-mono font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {formatRecordingTime(recordingSeconds)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelRecording}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors"
                title="Cancel recording"
              >
                <X size={18} />
              </button>
              <button
                type="button"
                onClick={stopRecordingAndSend}
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md"
              >
                <Send size={14} /> Send Voice
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-2">
            <input
              type="text"
              disabled={sending}
              placeholder="Type message or click mic to send voice note..."
              className="flex-grow px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />

            {/* Voice Note Button */}
            <button
              type="button"
              onClick={startRecording}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 p-2.5 rounded-xl border border-slate-700 transition-all focus:outline-none shadow-sm flex items-center justify-center"
              title="Record & send voice note"
            >
              <Mic size={18} />
            </button>

            {/* Send Text Button */}
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold p-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/20 focus:outline-none flex items-center justify-center"
              title="Send message"
            >
              <Send size={18} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
