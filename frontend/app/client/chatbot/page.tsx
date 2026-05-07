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
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#E30613] to-[#C00510] text-white py-4 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="text-white/90 hover:text-white transition-colors flex items-center gap-2"
            >
              ← {t('common.back') || 'Retour'}
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium">Propulsé par Groq AI</span>
            </div>
          </div>
          <div className="text-center mt-3">
            <div className="flex items-center justify-center gap-2 mb-1">
              <MessageCircle className="h-6 w-6" />
              <h1 className="text-2xl font-bold">{t('chatbot.title') || 'Assistant Chery'}</h1>
            </div>
            <p className="text-sm text-white/90">{t('common.available247') || 'Disponible 24/7 pour vous aider'}</p>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-4 mt-4 rounded-lg shadow-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800 mb-1">Erreur de connexion</p>
              <p className="text-sm text-red-700">{error}</p>
              {error.includes('backend') && (
                <div className="mt-3 p-3 bg-white rounded border border-red-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2">💡 Solution:</p>
                  <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Ouvrez un nouveau terminal</li>
                    <li>Exécutez: <code className="bg-gray-100 px-1 py-0.5 rounded">cd backend && npm start</code></li>
                    <li>Attendez le message "Serveur démarré sur le port 3000"</li>
                    <li>Rechargez cette page</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 1 && (
          <div className="max-w-2xl mx-auto mb-6">
            <p className="text-center text-gray-600 mb-4 text-sm">
              💡 Questions rapides :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="text-left p-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            } animate-fadeIn`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-[#E30613] to-[#C00510] text-white rounded-2xl rounded-br-sm'
                  : message.error
                  ? 'bg-red-50 text-red-900 border border-red-200 rounded-2xl rounded-bl-sm'
                  : 'bg-white text-gray-800 rounded-2xl rounded-bl-sm shadow-md border border-gray-100'
              } px-4 py-3`}
            >
              {message.role === 'bot' && !message.error && (
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                  <MessageCircle className="h-3 w-3" />
                  <span>Assistant Chery</span>
                </div>
              )}
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                {message.text}
              </p>
              {message.timestamp && (
                <p className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-white/70' : 'text-gray-400'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {loading && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-white rounded-2xl rounded-bl-sm shadow-md border border-gray-100 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#E30613] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-[#E30613] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-[#E30613] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-gray-600">
                  {t('chatbot.typing') || 'En train d&apos;écrire...'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={t('common.writeMessage') || 'Écrivez votre message...'}
            className="flex-1 bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-[15px] resize-none focus:outline-none focus:ring-2 focus:ring-[#E30613] focus:border-transparent max-h-32 transition-all"
            rows={1}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-[#E30613] to-[#C00510] text-white font-semibold px-6 py-3 rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            <span className="hidden sm:inline">{t('common.send') || 'Envoyer'}</span>
          </button>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          ⚡ Réponses rapides grâce à Groq AI
        </p>
      </div>
    </div>
  );
}
