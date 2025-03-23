import axios from "axios";

const BASE_URL = "https://api.freeapi.app/api/v1/chat-app";

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
};
