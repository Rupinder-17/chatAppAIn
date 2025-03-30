import api from "./api";

// const BASE_URL = "https://api.freeapi.app/api/v1/chat-app";

const MAX_ATTACHMENTS = 5;

export const chatService = {
  getAvailableUsers: async () => {
    try {
      const response = await api.get(`/chat-app/chats/users`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch available users";
    }
  },

  getAllMessages: async (accessToken, chatId) => {
    try {
      const response = await api.get(`/chat-app/messages/${chatId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch messages";
    }
  },

  createOneOnOneChat: async (accessToken, receiverId) => {
    try {
      const response = await api.post(`/chat-app/chats/c/${receiverId}`, {});
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to create chat";
    }
  },

  sendMessage: async (accessToken, chatId, message, attachments = []) => {
    try {
      if (attachments.length > MAX_ATTACHMENTS) {
        throw new Error(`Maximum ${MAX_ATTACHMENTS} attachments are allowed`);
      }

      const formData = new FormData();
      formData.append("content", message);

      attachments.forEach((file) => {
        formData.append(`attachments`, file);
      });

      const response = await api.post(
        `/chat-app/messages/${chatId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to send message";
    }
  },
};
