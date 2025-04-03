import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { chatService } from "../services/chatService";

export const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await chatService.getAllChats();
        setChats(response.data);
      } catch (err) {
        setError("Failed to fetch chats");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  const handleChatClick = (chat) => {
    if (chat.isGroupChat) {
      navigate(`/group-chat-room/${chat._id}`);
    } else {
      navigate(`/chat-room/${chat._id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Your Chats</h1>
        <button
          onClick={() => {
            navigate("/onlineusers");
          }}
          className="p-2.5 text-gray-600 hover:text-indigo-600 bg-gray-100 hover:bg-indigo-50 rounded-lg transition-all duration-200 transform hover:scale-105"
          title="Start New Chat"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        {chats.map((chat) => {
          const otherParticipant = chat.isGroupChat
            ? null
            : chat.participants.find(
                (p) => p._id !== localStorage.getItem("userId")
              );
          const initial = chat.isGroupChat
            ? chat.name[0]?.toUpperCase()
            : otherParticipant?.username[0]?.toUpperCase() || "?";

          return (
            <div
              key={chat._id}
              onClick={() => handleChatClick(chat)}
              className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 hover:border-indigo-100"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                    {initial}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {chat.isGroupChat
                        ? chat.name
                        : otherParticipant?.username || "Unknown User"}
                    </h3>
                    {chat.latestMessage && (
                      <span className="text-xs text-gray-500">
                        {new Date(
                          chat.latestMessage.createdAt
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600">
                      {chat.isGroupChat
                        ? `${chat.participants.length} participants`
                        : "Direct Message"}
                    </p>
                  </div>
                  {chat.latestMessage && (
                    <p className="text-sm text-gray-500 mt-1 truncate">
                      <span className="font-medium">
                        {chat.latestMessage.sender.username}:
                      </span>{" "}
                      {chat.latestMessage.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {chats.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <svg
              className="w-12 h-12 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-gray-600 font-medium">No chats yet</p>
            <p className="text-gray-500 text-sm mt-1">
              Start a new conversation!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
