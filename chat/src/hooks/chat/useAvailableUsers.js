import { useState } from "react";
import { chatService } from "../../services/chatService";

export const useAvailableUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAvailableUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatService.getAvailableUsers();
      setUsers(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    fetchAvailableUsers,
  };
};
