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
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex gap-6 items-center">

      <button className="bg-blue-600 text-white px-3 py-1 rounded-xl" onClick={()=>{
        navigate('/onlineusers')
      }}>go back</button>
      <h2 className="text-2xl font-bold mb-6">Create Group Chat</h2>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="groupName"
            className="block text-sm font-medium text-gray-700"
          >
            Group Name
          </label>
          <input
            type="text"
            id="groupName"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Enter group name"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Participants (minimum 2)
          </label>
          <div className="max-h-60 overflow-y-auto border rounded-md p-2">
            {availableUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center space-x-2 p-2 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  id={user._id}
                  checked={selectedUsers.includes(user._id)}
                  onChange={() => handleUserSelect(user._id)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor={user._id} className="text-sm text-gray-700">
                  {user.username}
                </label>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Group Chat"}
        </button>
      </form>
    </div>
  );
};