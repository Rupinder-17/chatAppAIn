import { useOnlineUsers } from "../hooks/useOnlineUsers";

export const OnlineUsers = () => {
  const { onlineUsers, loading, error, refreshUsers } = useOnlineUsers();
  console.log("onli", onlineUsers);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
        <button
          onClick={refreshUsers}
          className="ml-2 text-indigo-600 hover:text-indigo-500 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Online Users</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {onlineUsers.map((user) => (
          <div
            key={user._id}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-semibold">
                  {user.username?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{user.username}</h3>
                <span className="text-sm text-green-500">Online</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {onlineUsers.length === 0 && (
        <p className="text-center text-gray-500">
          No users are currently online
        </p>
      )}
    </div>
  );
};
