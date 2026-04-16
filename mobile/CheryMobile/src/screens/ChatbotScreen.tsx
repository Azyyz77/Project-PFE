import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { API_BASE_URL } from '../config/api';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

interface ChatbotScreenProps {
  onBack?: () => void;
}

export default function ChatbotScreen({ onBack }: ChatbotScreenProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'bot',
      text: '👋 Bonjour ! Je suis l\'assistant SAV Chery Tunisie. Comment puis-je vous aider ?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

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
      const response = await fetch(`${API_BASE_URL}/chatbot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history: getHistory() })
      });

      const data = await response.json();
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity 
            onPress={onBack}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Retour</Text>
          </TouchableOpacity>
        )}
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>🚗 Assistant SAV Chery</Text>
          <Text style={styles.headerSub}>Disponible 24h/24</Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === 'user' ? styles.userBubble : styles.botBubble
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                item.role === 'user' ? styles.userText : styles.botText
              ]}
            >
              {item.text}
            </Text>
          </View>
        )}
        contentContainerStyle={{ padding: 16 }}
      />

      {/* Typing indicator */}
      {loading && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color="#E30613" />
          <Text style={{ marginLeft: 8, color: '#666' }}>
            Assistant en train de répondre...
          </Text>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Écrivez votre message..."
          placeholderTextColor="#999"
          style={styles.input}
          multiline
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={loading}
          style={[styles.sendBtn, loading && { opacity: 0.5 }]}
        >
          <Text style={styles.sendText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    backgroundColor: '#E30613',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  headerSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#E30613',
    borderBottomRightRadius: 4
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  userText: { color: 'white' },
  botText: { color: '#222' },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8
  },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#EEE'
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: '#E30613',
    borderRadius: 24,
    paddingHorizontal: 16,
    justifyContent: 'center'
  },
  sendText: { color: 'white', fontWeight: '600' }
});
