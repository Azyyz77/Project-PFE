'use client';

import React, { useState, useRef, useEffect } from 'react';
import { chatbotApi } from '@/lib/api/chatbot';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  MessageCircle, 
  Send, 
  Loader2, 
  AlertCircle, 
  Sparkles,
  ArrowLeft,
  Bot,
  User,
  Zap,
  RotateCcw
} from 'lucide-react';
import {
  ClientPageWrapper,
  ClientButton,
  ClientCard,
} from '@/components/client';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp?: Date;
  error?: boolean;
}

export default function ChatbotPage() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'bot',
      text: t('chatbot.greeting') || 'Bonjour ! Je suis votre assistant virtuel STA Chery. Comment puis-je vous accompagner aujourd’hui ?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      if (updated[0].id === '0' && updated[0].role === 'bot') {
        updated[0] = { 
          ...updated[0], 
          text: t('chatbot.greeting') || 'Bonjour ! Je suis votre assistant virtuel STA Chery. Comment puis-je vous accompagner aujourd’hui ?' 
        };
      }
      return updated;
    });
  }, [t]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const getHistory = (): [string, string][] => {
    const history: [string, string][] = [];
    const msgs = messages.filter(m => m.id !== '0' && !m.error);
    for (let i = 0; i < msgs.length - 1; i += 2) {
      if (msgs[i] && msgs[i + 1] && msgs[i].role === 'user' && msgs[i + 1].role === 'bot') {
        history.push([msgs[i].text, msgs[i + 1].text]);
      }
    }
    return history;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const data = await chatbotApi.sendMessage({
        message: userMessage,
        history: getHistory()
      });

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: data.reply,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Chatbot error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(errorMsg);
      
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          text: t('chatbot.fallback') || '⚠️ Désolé, je rencontre un problème technique. Veuillez réessayer dans quelques instants.',
          timestamp: new Date(),
          error: true
        }
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const quickQuestions = [
    'Prendre un rendez-vous',
    'Modèles disponibles',
    'Garantie véhicule',
    'Agence la plus proche'
  ];

  return (
    <ClientPageWrapper noPadding fullHeight className="flex flex-col bg-[#f8fafc] overflow-hidden rounded-lg shadow-md border border-[#E4E6EB]">
      {/* ─── Chat Header ─── */}
      <div className="bg-white p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 h-40 w-40 rounded-full bg-blue-600/20 blur-3xl" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-tr from-red-600 to-red-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-[#0b1221]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight leading-none mb-1">AI Assistant</h1>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#B0B3B8]">STA Chery Intelligent Agent</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setMessages([messages[0]])}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
              title="Réinitialiser"
            >
              <RotateCcw className="h-4 w-4 text-slate-300" />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">Groq Powered</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Messages Container ─── */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((message, idx) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] sm:max-w-[70%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`shrink-0 h-8 w-8 rounded-xl flex items-center justify-center shadow-sm ${
                  message.role === 'user' 
                    ? 'bg-white border border-[#E4E6EB]' 
                    : 'bg-white'
                }`}>
                  {message.role === 'user' 
                    ? <User className="h-4 w-4 text-[#65676B]" /> 
                    : <Bot className="h-4 w-4 text-blue-500" />
                  }
                </div>

                {/* Bubble */}
                <div className="space-y-1">
                  <div className={`px-5 py-3.5 rounded-[1.5rem] shadow-sm font-medium text-[15px] leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : message.error
                      ? 'bg-blue-50 text-blue-700 border border-blue-100 rounded-tl-none'
                      : 'bg-white text-[#050505] border border-[#E4E6EB] rounded-tl-none'
                  }`}>
                    {message.text}
                  </div>
                  {message.timestamp && (
                    <p className={`text-[10px] font-bold uppercase tracking-wide opacity-40 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start items-center gap-3"
          >
            <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <Bot className="h-4 w-4 text-blue-500" />
            </div>
            <div className="px-5 py-3.5 bg-white border border-[#E4E6EB] rounded-[1.5rem] rounded-tl-none shadow-sm flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs font-bold text-[#B0B3B8] uppercase tracking-wide">Assistant réfléchit...</span>
            </div>
          </motion.div>
        )}

        {/* Quick Actions (only when empty or greeting) */}
        {messages.length === 1 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-2 pt-4 justify-center sm:justify-start"
          >
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(q);
                  inputRef.current?.focus();
                }}
                className="px-4 py-2 rounded-full bg-white border border-[#E4E6EB] text-xs font-bold text-[#65676B] hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm active:scale-95"
              >
                {q}
              </button>
            ))}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ─── Input Area ─── */}
      <div className="p-6 bg-white border-t border-[#E4E6EB]">
        <div className="max-w-4xl mx-auto relative group">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Posez votre question ici..."
            className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-lg pl-6 pr-20 py-4 text-[15px] font-medium resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all max-h-32 min-h-[60px]"
            rows={1}
            disabled={loading}
          />
          <div className="absolute right-2 bottom-2">
            <ClientButton
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              variant="primary"
              size="small"
              className="rounded-lg h-[44px] w-[44px] !p-0 flex items-center justify-center shadow-blue-500/20"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </ClientButton>
          </div>
        </div>
        <p className="text-[10px] text-center text-[#B0B3B8] font-bold uppercase tracking-wide mt-4">
          L'IA peut faire des erreurs. Vérifiez les informations importantes.
        </p>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </ClientPageWrapper>
  );
}
