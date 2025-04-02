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
        <h1 className="text-2xl font-bold">Your Chats</h1>
        <button
          onClick={() => navigate("/onlineusers")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start New Chat
        </button>
      </div>

      <div className="space-y-4">
        {chats.map((chat) => (
          <div
            key={chat._id}
            onClick={() => handleChatClick(chat)}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {chat.isGroupChat
                    ? chat.name
                    : chat.participants.find(
                        (p) => p._id !== localStorage.getItem("userId")
                      )?.username || "Unknown User"}
                </h3>
                <p className="text-gray-600 text-sm">
                  {chat.isGroupChat
                    ? `${chat.participants.length} participants`
                    : "Direct Message"}
                </p>
              </div>
              {chat.latestMessage && (
                <div className="text-sm text-gray-500">
                  {new Date(chat.latestMessage.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>
            {chat.latestMessage && (
              <p className="text-gray-600 mt-2 truncate">
                {chat.latestMessage.sender.username}:{" "}
                {chat.latestMessage.content}
              </p>
            )}
          </div>
        ))}

        {chats.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No chats yet. Start a new conversation!
          </div>
        )}
      </div>
    </div>
  );
};
