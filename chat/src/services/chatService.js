import axios from "axios";

const BASE_URL = "https://api.freeapi.app/api/v1/chat-app";

const MAX_ATTACHMENTS = 5;

export const chatService = {
  getAvailableUsers: async (accessToken) => {
    try {
      const response = await axios.get(`${BASE_URL}/chats/users`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch available users";
    }
  },

  getAllMessages: async (accessToken, chatId) => {
    try {
      const response = await axios.get(`${BASE_URL}/messages/${chatId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch messages";
    }
  },

  createOneOnOneChat: async (accessToken, receiverId) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/chats/c/${receiverId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
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

      const response = await axios.post(
        `${BASE_URL}/messages/${chatId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
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
