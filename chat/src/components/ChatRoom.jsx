import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { chatService } from "../services/chatService";

export const ChatRoom = () => {
  const navigate = useNavigate();
  const { receiverId } = useParams();
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageInput, setMessageInput] = useState("");

  useEffect(() => {
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

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !chatId) return;

    try {
      setSendingMessage(true);
      await chatService.sendMessage(accessToken, chatId, messageInput);
      const messagesResponse = await chatService.getAllMessages(
        accessToken,
        chatId
      );
      setMessages(messagesResponse.data);
      setMessageInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    console.log("msgid", messageId);

    try {
      await chatService.deleteMessage(messageId);
      const messagesResponse = await chatService.getAllMessages(
        accessToken,
        chatId
      );
      setMessages(messagesResponse.data);
    } catch (error) {
      alert("Failed to delete message: " + error);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-red-600 mb-4">Error</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Chat Room</h2>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/onlineusers")}
                className="p-2 text-gray-500 hover:text-indigo-600 bg-gray-100 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Back to Users"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              {/* <button
                onClick={() => handleDeleteChat(chatId)}
                className="p-2 text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Chat"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button> */}
            </div>
          </div>

          <div className="space-y-4 mb-6 h-[calc(100vh-20rem)] overflow-y-auto p-4 bg-gray-50 rounded-lg">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${
                  message.sender === receiverId
                    ? "justify-start"
                    : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.sender === receiverId
                      ? "bg-gray-200 text-gray-900"
                      : "bg-indigo-600 text-white"
                  }`}
                >
                  <p className="break-words">{message.content}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                    {message.sender !== receiverId && (
                      <button
                        onClick={() => handleDeleteMessage(message._id)}
                        className="text-xs opacity-70 hover:opacity-100"
                        title="Delete Message"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={sendingMessage}
            />
            <button
              onClick={handleSendMessage}
              disabled={sendingMessage || !messageInput.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
