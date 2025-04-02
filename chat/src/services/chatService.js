import api from "./api";

const MAX_ATTACHMENTS = 5;

export const chatService = {
  createGroupChat: async (name, participants) => {
    try {
      if (!Array.isArray(participants) || participants.length < 2) {
        throw new Error(
          "A group chat requires at least 3 participants including you"
        );
      }

      const response = await api.post(`/chat-app/chats/group`, {
        name,
        participants,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to create group chat";
    }
  },

  getAvailableUsers: async () => {
    try {
      const response = await api.get(`/chat-app/chats/users`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch available users";
    }
  },

  getAllMessages: async (chatId) => {
    try {
      const response = await api.get(`/chat-app/messages/${chatId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch messages";
    }
  },

  createOneOnOneChat: async (receiverId) => {
    console.log("receiverIdiiiii:", receiverId);

    try {
      const response = await api.post(`/chat-app/chats/c/${receiverId}`, {});
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to create chat";
    }
  },

  sendMessage: async (chatId, message, attachments = []) => {
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

  deleteMessage: async (chatId, messageId) => {
    try {
      const response = await api.delete(
        `/chat-app/messages/${chatId}/${messageId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to delete message";
    }
  },
};
