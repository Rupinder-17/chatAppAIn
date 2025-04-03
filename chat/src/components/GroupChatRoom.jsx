import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { chatService } from "../services/chatService";

export const GroupChatRoom = () => {
  const navigate = useNavigate();
  const { groupChatId } = useParams();
  const { accessToken, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    const initializeChat = async () => {
      if (!accessToken || !groupChatId) return;

      try {
        setLoading(true);
        setError(null);
        setChatId(groupChatId);
        const messagesResponse = await chatService.getAllMessages(groupChatId);
        setMessages(messagesResponse.data || []);
        setGroupName(messagesResponse.data?.chat?.name);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create chat");
        console.error("Chat creation error:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
  }, [accessToken, groupChatId]);

  useEffect(() => {
    let messageInterval;

    if (chatId) {
      messageInterval = setInterval(async () => {
        try {
          const messagesResponse = await chatService.getAllMessages(chatId);
          setMessages(messagesResponse.data);
        } catch (err) {
          console.error("Failed to fetch messages:", err);
        }
      }, 8000);
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
      await chatService.sendMessage(chatId, messageInput);
      const messagesResponse = await chatService.getAllMessages(chatId);
      setMessages(messagesResponse.data);
      setMessageInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    console.log("chatidmess", chatId);

    console.log("msgid", messageId);

    try {
      await chatService.deleteMessage(chatId, messageId);
      const messagesResponse = await chatService.getAllMessages(chatId);
      setMessages(messagesResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete message");
      console.error("Message deletion error:", err);
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
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-semibold">
                  {groupName?.[0]?.toUpperCase() || "G"}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{groupName}</h2>
            </div>
            <button
              onClick={() => navigate("/allchats")}
              className="p-2 text-gray-500 hover:text-indigo-600 bg-gray-100 hover:bg-indigo-50 rounded-lg transition-all duration-200 transform hover:scale-105"
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
          </div>

          <div className="space-y-4 p-4 h-[calc(100vh-16rem)] overflow-y-auto bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {[...messages].reverse().map((message) => (
              <div
                key={message._id}
                className={`flex ${
                  message.sender._id === user._id
                    ? "justify-end"
                    : "justify-start"
                } animate-fade-in`}
              >
                <div
                  className={`flex ${
                    message.sender._id === user._id
                      ? "flex-row-reverse"
                      : "flex-row"
                  } items-start space-x-2 max-w-[80%]`}
                >
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 bg-gradient-to-br ${message.sender._id !== user._id ? "from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-md":""}`}>
                      <span className="text-white text-sm font-semibold">
                        {message.sender._id !== user._id &&(
                           message.sender.username[0].toUpperCase()
                        )}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`flex flex-col ${
                      message.sender._id === user._id
                        ? "items-end"
                        : "items-start"
                    }`}
                  >
                    {message.sender._id !== user._id && (
                      <span className="text-xs text-gray-500 mb-1">
                        {message.sender.username}
                      </span>
                    )}
                    <div
                      className={`p-3 rounded-2xl ${
                        message.sender._id === user._id
                          ? "bg-indigo-600 text-white rounded-tr-none"
                          : "bg-white text-gray-900 rounded-tl-none shadow-sm border border-gray-100"
                      }`}
                    >
                      <p className="break-words text-sm">{message.content}</p>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-400">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {message.sender._id === user._id && (
                        <button
                          onClick={() => handleDeleteMessage(message._id)}
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete Message"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                disabled={sendingMessage}
              />
              <button
                onClick={handleSendMessage}
                disabled={sendingMessage}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {sendingMessage ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
