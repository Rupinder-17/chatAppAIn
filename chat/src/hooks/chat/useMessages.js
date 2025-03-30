import { useState } from "react";
import { chatService } from "../../services/chatService";

export const useMessages = (chatId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatService.getAllMessages(null, chatId);
      setMessages(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content) => {
    if (!content.trim() || !chatId) return;

    try {
      setSendingMessage(true);
      setError(null);
      await chatService.sendMessage(null, chatId, content);
      await fetchMessages();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      return false;
    } finally {
      setSendingMessage(false);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      setError(null);
      await chatService.deleteMessage(messageId);
      await fetchMessages();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete message");
      return false;
    }
  };

  return {
    messages,
    loading,
    error,
    sendingMessage,
    fetchMessages,
    sendMessage,
    deleteMessage,
  };
};
