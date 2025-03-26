import { useState, useEffect } from "react";
import { chatService } from "../services/chatService";
import { useAuth } from "./useAuth";

export const useChat = (receiverId) => {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);

  const initializeChat = async () => {
    if (!accessToken || !receiverId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await chatService.createOneOnOneChat(
        accessToken,
        receiverId
      );
      setChatId(response.data._id);
      const messagesResponse = await chatService.getAllMessages(
        accessToken,
        response.data._id
      );
      setMessages(messagesResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create chat");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (messageContent) => {
    if (!messageContent.trim() || !chatId || sendingMessage) return;

    try {
      setSendingMessage(true);
      await chatService.sendMessage(accessToken, chatId, messageContent);
      const messagesResponse = await chatService.getAllMessages(
        accessToken,
        chatId
      );
      setMessages(messagesResponse.data);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      return false;
    } finally {
      setSendingMessage(false);
    }
  };

  useEffect(() => {
    initializeChat();
  }, [accessToken, receiverId]);

  useEffect(() => {
    let messageInterval;

    if (chatId) {
      messageInterval = setInterval(async () => {
        try {
          const messagesResponse = await chatService.getAllMessages(
            accessToken,
            chatId
          );
          setMessages(messagesResponse.data);
        } catch (err) {
          console.error("Failed to fetch messages:", err);
        }
      }, 2000);
    }

    return () => {
      if (messageInterval) {
        clearInterval(messageInterval);
      }
    };
  }, [accessToken, chatId]);

  return {
    loading,
    error,
    messages,
    sendingMessage,
    sendMessage,
  };
};
