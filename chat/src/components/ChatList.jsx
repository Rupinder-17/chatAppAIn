import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { chatService } from "../services/chatService";
import { useAuth } from "../hooks/useAuth";

export const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  console.log("User:", user);
  console.log("User ID:", user?._id);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await chatService.getAllChats();
        console.log("Fetched chats:", response);
        if (response && response.data) {
          setChats(response.data);
        } else {
          throw new Error("Invalid response structure");
        }
      } catch (err) {
        setError("Failed to fetch chats");
        console.error("Error fetching chats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const handleChatClick = (chat) => {
    console.log("Chat clicked:", chat);
    if (chat.isGroupChat) {
      navigate(`/group-chat-room/${chat._id}`);
    } else {
      const otherParticipant = chat.participants.find(
        (p) => p._id !== user._id
      );
      console.log("Other participant:", otherParticipant);

      if (otherParticipant) {
        console.log("Navigating to chat with ID:", otherParticipant._id);
        navigate(`/chat/${otherParticipant._id}`);
      } else {
        console.error("Could not find other participant in chat");
      }
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
        <div className="flex space-x-2">
          <button
            onClick={handleLogout}
            className="p-2.5 text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-105"
            title="Logout"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
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
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-10 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200"
          />
          <svg
            className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="space-y-3">
        {chats
          .filter((chat) => {
            if (!searchQuery) return true;

            // For group chats, search in the group name
            if (chat.isGroupChat) {
              return chat.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            }

            // For direct messages, search in the other participant's username
            const otherParticipant = chat.participants.find(
              (p) => p._id !== user._id
            );
            return otherParticipant?.username
              .toLowerCase()
              .includes(searchQuery.toLowerCase());
          })
          .map((chat) => {
            const otherParticipant = chat.isGroupChat
              ? null
              : chat.participants.find((p) => p._id !== user._id);
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
