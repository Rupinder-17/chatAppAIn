import { useState } from "react";
import { chatService } from "../../services/chatService";

export const useChatActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatId, setChatId] = useState(null);

  const createOneOnOneChat = async (receiverId) => {
    if (!receiverId) return null;

    try {
      setLoading(true);
      setError(null);
      const response = await chatService.createOneOnOneChat(null, receiverId);
      setChatId(response.data._id);
      return response.data._id;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create chat");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    chatId,
    createOneOnOneChat,
  };
};
