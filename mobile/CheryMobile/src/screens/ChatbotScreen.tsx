import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { API_BASE_URL } from '../config/api';
import { colors, spacing, borderRadius, fontSize, shadows } from '../styles/theme';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

export default function ChatbotScreen({ navigation }: any) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'bot', text: '👋 Bonjour ! Je suis l\'assistant SAV Chery Tunisie. Comment puis-je vous aider ?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

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
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history: getHistory() }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'bot', text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'bot',
        text: '⚠️ Service temporairement indisponible. Réessayez plus tard.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Retour</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🚗 Assistant SAV Chery</Text>
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
          <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.botBubble]}>
            <Text style={[styles.bubbleText, item.role === 'user' ? styles.userText : styles.botText]}>
              {item.text}
            </Text>
          </View>
        )}
        contentContainerStyle={{ padding: spacing.lg }}
      />

      {/* Typing */}
      {loading && (
        <View style={styles.typingRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.typingText}>Assistant en train de répondre...</Text>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Écrivez votre message..."
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          multiline
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity onPress={sendMessage} disabled={loading} style={[styles.sendBtn, loading && { opacity: 0.5 }]}>
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary, paddingTop: 50,
    paddingBottom: spacing.lg, paddingHorizontal: spacing.lg,
  },
  backBtn: { marginBottom: spacing.sm },
  backBtnText: { color: 'rgba(255,255,255,0.9)', fontSize: fontSize.md },
  headerContent: { alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: fontSize.lg, fontWeight: 'bold' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: fontSize.sm, marginTop: 2 },
  bubble: { maxWidth: '80%', padding: spacing.md, borderRadius: borderRadius.lg, marginVertical: 4 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  botBubble: {
    alignSelf: 'flex-start', backgroundColor: colors.surface,
    borderBottomLeftRadius: 4, ...shadows.sm,
  },
  bubbleText: { fontSize: fontSize.base, lineHeight: 22 },
  userText: { color: '#fff' },
  botText: { color: colors.textPrimary },
  typingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  typingText: { marginLeft: spacing.sm, color: colors.textMuted, fontSize: fontSize.sm },
  inputRow: {
    flexDirection: 'row', padding: spacing.md,
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.borderLight,
  },
  input: {
    flex: 1, backgroundColor: colors.background,
    borderRadius: borderRadius.full, paddingHorizontal: spacing.lg,
    paddingVertical: 10, fontSize: fontSize.base, maxHeight: 100,
    color: colors.textPrimary,
  },
  sendBtn: {
    marginLeft: spacing.sm, backgroundColor: colors.primary,
    borderRadius: borderRadius.full, width: 44, height: 44,
    justifyContent: 'center', alignItems: 'center',
  },
  sendText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
