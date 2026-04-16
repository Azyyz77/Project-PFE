'use client';

import React, { useState, useRef, useEffect } from 'react';
import { chatbotApi } from '@/lib/api/chatbot';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'bot',
      text: '👋 Bonjour ! Je suis l\'assistant SAV Chery Tunisie. Comment puis-je vous aider ?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Convert messages to history format
  const getHistory = (): [string, string][] => {
    const history: [string, string][] = [];
    const msgs = messages.filter(m => m.id !== '0');
    for (let i = 0; i < msgs.length - 1; i += 2) {
      if (msgs[i] && msgs[i + 1]) {
        history.push([msgs[i].text, msgs[i + 1].text]);
      }
    }
    return history;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const data = await chatbotApi.sendMessage({
        message: input,
        history: getHistory()
      });

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: data.reply
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          text: '⚠️ Service temporairement indisponible. Appelez-nous au +216 XX XXX XXX'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50">
      {/* Header */}
      <div className="bg-[#E30613] text-white py-6 px-4 shadow-md">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => window.history.back()}
              className="text-white/90 hover:text-white transition-colors"
            >
              ← Retour
            </button>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold">🚗 Assistant SAV Chery</h1>
            <p className="text-sm text-white/80 mt-1">Disponible 24h/24</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-[#E30613] text-white rounded-br-sm'
                  : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
              }`}
            >
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                {message.text}
              </p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {loading && (
          <div className="flex items-center space-x-2 px-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-[#E30613] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-[#E30613] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-[#E30613] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-sm text-gray-600">
              Assistant en train de répondre...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-3">
        <div className="flex items-end space-x-2 max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Écrivez votre message..."
            className="flex-1 bg-gray-100 rounded-3xl px-4 py-3 text-[15px] resize-none focus:outline-none focus:ring-2 focus:ring-[#E30613] max-h-32"
            rows={1}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-[#E30613] text-white font-semibold px-6 py-3 rounded-3xl hover:bg-[#C00510] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
