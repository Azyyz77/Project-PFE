'use client';

import React, { useState, useRef, useEffect } from 'react';
import { chatbotApi } from '@/lib/api/chatbot';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageCircle, Send, Loader2, AlertCircle, Sparkles } from 'lucide-react';

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
      text: t('chatbot.greeting') || 'Bonjour ! Je suis l&apos;assistant virtuel Chery. Comment puis-je vous aider aujourd&apos;hui ?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Add CSS for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fade-in-up {
        animation: fadeInUp 0.6s ease-out forwards;
      }
      .animate-fade-in {
        animation: fadeIn 0.4s ease-out forwards;
      }
      .animate-slide-down {
        animation: slideDown 0.3s ease-out forwards;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      if (updated[0].id === '0' && updated[0].role === 'bot') {
        updated[0] = { 
          ...updated[0], 
          text: t('chatbot.greeting') || 'Bonjour ! Je suis l&apos;assistant virtuel Chery. Comment puis-je vous aider aujourd&apos;hui ?' 
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
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  // Convert messages to history format
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
          text: t('chatbot.fallback') || '⚠️ Désolé, je rencontre un problème technique. Veuillez réessayer dans quelques instants ou contactez notre service client.',
          timestamp: new Date(),
          error: true
        }
      ]);
    } finally {
      setLoading(false);
      // Refocus input after sending
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
    'Comment prendre un rendez-vous ?',
    'Quels sont les modèles Chery disponibles ?',
    'Quelle est la garantie sur les véhicules ?',
    'Où se trouve l&apos;agence la plus proche ?'
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header - Compact and Beautiful */}
      <div className="relative bg-gradient-to-r from-[#0f2543] via-[#1b355d] to-[#0f2543] text-white shadow-2xl overflow-hidden flex-shrink-0">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-32 translate-x-32 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-2xl translate-y-24 -translate-x-24 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-all duration-300 group px-3 py-2 rounded-lg hover:bg-white/10 hover:shadow-lg hover:-translate-y-0.5"
            >
              <span className="text-lg group-hover:scale-110 transition-transform duration-300">←</span>
              <span className="text-sm font-medium">Retour</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 shadow-lg">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Assistant SAV Chery</h1>
                <p className="text-xs text-white/80">Disponible 24h/24, 7j/7</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20">
              <Sparkles className="h-3.5 w-3.5 text-yellow-300 animate-pulse" />
              <span className="text-xs font-medium">Groq AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner - Compact */}
      {error && (
        <div className="mx-6 mt-3 bg-red-50 border-l-4 border-red-500 p-3 rounded-lg shadow-md animate-slide-down flex-shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Main Chat Container - Perfectly Fitted */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Quick Questions - Compact and Beautiful */}
            {messages.length === 1 && (
              <div className="animate-fade-in-up">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-[#0f2543] to-[#1b355d] shadow-md">
                    <span className="text-white text-xs">💡</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800">Questions rapides</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      className="group relative text-left p-3 bg-white border-2 border-slate-200 hover:border-[#0f2543] rounded-xl transition-all duration-300 shadow-sm hover:shadow-xl transform hover:-translate-y-1.5"
                      style={{
                        animation: 'fadeInUp 0.5s ease-out forwards',
                        animationDelay: `${index * 100}ms`,
                        opacity: 0
                      }}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-gradient-to-br group-hover:from-[#0f2543] group-hover:to-[#1b355d] transition-all duration-300 flex-shrink-0 group-hover:scale-110 group-hover:rotate-3">
                          <MessageCircle className="h-3.5 w-3.5 text-slate-600 group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-xs text-gray-700 group-hover:text-[#0f2543] font-medium transition-colors leading-relaxed">
                          {question}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages - Compact and Beautiful */}
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  style={{
                    animation: 'fadeInUp 0.4s ease-out forwards',
                    animationDelay: `${Math.min(index * 50, 300)}ms`,
                    opacity: 0
                  }}
                >
                  {message.role === 'bot' && (
                    <div className="flex items-start gap-2.5 max-w-[85%]">
                      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#0f2543] to-[#1b355d] shadow-lg flex-shrink-0 mt-0.5">
                        <MessageCircle className="h-4 w-4 text-white" />
                      </div>
                      <div className={`flex-1 ${
                        message.error
                          ? 'bg-red-50 border-2 border-red-200'
                          : 'bg-white border-2 border-slate-200 hover:border-[#0f2543]/30'
                      } rounded-2xl rounded-tl-sm shadow-md p-3.5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1`}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-bold text-[#0f2543]">Assistant Chery</span>
                          {message.timestamp && (
                            <span className="text-xs text-gray-400">• {formatTime(message.timestamp)}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {message.text}
                        </p>
                      </div>
                    </div>
                  )}

                  {message.role === 'user' && (
                    <div className="flex items-start gap-2.5 max-w-[85%]">
                      <div className="flex-1 bg-gradient-to-br from-[#0f2543] to-[#1b355d] rounded-2xl rounded-tr-sm shadow-lg p-3.5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                        <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
                          {message.text}
                        </p>
                        {message.timestamp && (
                          <p className="text-xs text-white/60 mt-1.5 text-right">
                            {formatTime(message.timestamp)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">V</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator - Compact */}
              {loading && (
                <div className="flex justify-start animate-fade-in">
                  <div className="flex items-start gap-2.5 max-w-[85%]">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#0f2543] to-[#1b355d] shadow-lg flex-shrink-0">
                      <MessageCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-white border-2 border-slate-200 rounded-2xl rounded-tl-sm shadow-md p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex space-x-1.5">
                          <div className="w-2 h-2 bg-[#0f2543] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-[#1b355d] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-[#0f2543] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-xs text-gray-600">En train d&apos;écrire...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area - Fixed Bottom, Perfectly Fitted */}
        <div className="bg-white border-t-2 border-slate-200 shadow-2xl flex-shrink-0">
          <div className="max-w-4xl mx-auto px-6 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Écrivez votre message..."
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0f2543] focus:border-[#0f2543] transition-all placeholder:text-gray-400 max-h-24"
                  rows={1}
                  disabled={loading}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#0f2543] to-[#1b355d] text-white font-semibold px-5 py-3 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group flex-shrink-0"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    <span className="text-sm">Envoyer</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <Sparkles className="h-3 w-3 text-yellow-500" />
              <p className="text-xs text-gray-500">Propulsé par Groq AI</p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-slide-down {
          animation: slideDown 0.3s ease-out forwards;
        }
        
        /* Custom Scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
