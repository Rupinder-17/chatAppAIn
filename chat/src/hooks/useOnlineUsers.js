// import { useState, useEffect } from "react";
// import { chatService } from "../services/chatService";
// import { useAuth } from "./useAuth";

// export const useOnlineUsers = () => {
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const { accessToken } = useAuth();

//   const fetchOnlineUsers = async () => {
//     if (!accessToken) return;

//     try {
//       setLoading(true);
//       setError(null);
//       const response = await chatService.getAvailableUsers(accessToken);
//       setOnlineUsers(response.data);
//     } catch (err) {
//       setError(
//         err instanceof Error ? err.message : "Failed to fetch online users"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOnlineUsers();
//     // Fetch online users every 30 seconds
//     const interval = setInterval(fetchOnlineUsers, 30000);
//     return () => clearInterval(interval);
//   }, [accessToken]);

//   return {
//     onlineUsers,
//     loading,
//     error,
//     refreshUsers: fetchOnlineUsers,
//   };
// };
