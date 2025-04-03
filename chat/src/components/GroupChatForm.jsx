import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { chatService } from "../services/chatService";

export const GroupChatForm = () => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch available users when component mounts
  useState(() => {
    const fetchUsers = async () => {
      try {
        const response = await chatService.getAvailableUsers();
        setAvailableUsers(response.data);
      } catch (err) {
        setError("Failed to fetch users");
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  const handleUserSelect = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (selectedUsers.length < 2) {
        throw new Error(
          "Please select at least 2 other users to create a group chat"
        );
      }

      if (!groupName.trim()) {
        throw new Error("Please enter a group name");
      }

      const response = await chatService.createGroupChat(
        groupName,
        selectedUsers
      );
      navigate(`/group-chat-room/${response.data._id}`);
    } catch (err) {
      setError(err.message || "Failed to create group chat");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center gap-4 mb-8">
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2"
          onClick={() => navigate("/allchats")}
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
        <h2 className="text-2xl font-bold text-gray-900">Create Group Chat</h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
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
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="groupName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Group Name
          </label>
          <input
            type="text"
            id="groupName"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
            placeholder="Enter a memorable group name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Participants (minimum 2)
          </label>
          <div className="max-h-[300px] overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
            {availableUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center p-3 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex-1 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                    {user.username[0].toUpperCase()}
                  </div>
                  <label
                    htmlFor={user._id}
                    className="flex-1 text-sm text-gray-700 font-medium cursor-pointer"
                  >
                    {user.username}
                  </label>
                </div>
                <input
                  type="checkbox"
                  id={user._id}
                  checked={selectedUsers.includes(user._id)}
                  onChange={() => handleUserSelect(user._id)}
                  className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 transition-colors duration-200 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating...
            </>
          ) : (
            "Create Group Chat"
          )}
        </button>
      </form>
    </div>
  );
};
