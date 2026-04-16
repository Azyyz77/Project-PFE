import api from './axios';

export interface ChatMessage {
  message: string;
  history?: [string, string][];
}

export interface ChatResponse {
  reply: string;
}

export const chatbotApi = {
  sendMessage: async (data: ChatMessage): Promise<ChatResponse> => {
    const response = await api.post('/chatbot/chat', data);
    return response.data;
  }
};
