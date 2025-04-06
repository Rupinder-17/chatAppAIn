import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { chatService } from "../services/chatService";
import { useOnlineUsers } from "../hooks/useOnlineUsers";

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
  const [groupDetails, setGroupDetails] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [updatingName, setUpdatingName] = useState(false);
  const [showAddParticipants, setShowAddParticipants] = useState(false);
  const { onlineUsers } = useOnlineUsers();
  const [addingParticipant, setAddingParticipant] = useState(false);
  const [selectedUsersToAdd, setSelectedUsersToAdd] = useState([]);

  console.log("groupdetails", groupDetails);

  useEffect(() => {
    const initializeChat = async () => {
      if (!accessToken || !groupChatId) return;

      try {
        setLoading(true);
        setError(null);
        setChatId(groupChatId);
        const [messagesResponse, groupDetailsResponse] = await Promise.all([
          chatService.getAllMessages(groupChatId),
          chatService.getGroupChatDetails(groupChatId),
        ]);
        console.log(
          "messages",
          messagesResponse,
          "groupdetails",
          groupDetailsResponse
        );

        setMessages(messagesResponse.data || []);
        setGroupDetails(groupDetailsResponse.data);
        setGroupName(groupDetailsResponse.data?.name);
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
  const handleAddParticipants = async () => {
    if (selectedUsersToAdd.length === 0) return;

    try {
      setAddingParticipant(true);
      await Promise.all(
        selectedUsersToAdd.map((userId) =>
          chatService.addParticipant(groupChatId, userId)
        )
      );
      const updatedGroupDetails = await chatService.getGroupChatDetails(
        groupChatId
      );
      setGroupDetails(updatedGroupDetails.data);
      setSelectedUsersToAdd([]);
      setShowAddParticipants(false);
    } catch (err) {
      setError(err.message || "Failed to add participants");
    } finally {
      setAddingParticipant(false);
    }
  };

  const handleRemoveParticipant = async (participantId) => {
    try {
      await chatService.removeParticipant(groupChatId, participantId);
      const updatedGroupDetails = await chatService.getGroupChatDetails(
        groupChatId
      );
      setGroupDetails(updatedGroupDetails.data);
    } catch (err) {
      setError(err.message || "Failed to remove participant");
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="flex flex-col h-[calc(100vh-4rem)]">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
                  <span className="text-white text-xl font-semibold">
                    {groupName?.[0]?.toUpperCase() || "G"}
                  </span>
                </div>
                <div>
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="text-xl font-bold text-gray-900 border-b-2 border-indigo-500 focus:outline-none bg-transparent"
                        placeholder="Enter new group name"
                        disabled={updatingName}
                      />
                      <button
                        onClick={async () => {
                          if (!newGroupName.trim()) return;
                          try {
                            setUpdatingName(true);
                            await chatService.updateGroupChatName(
                              groupChatId,
                              newGroupName
                            );
                            setGroupName(newGroupName);
                            setIsEditingName(false);
                          } catch (err) {
                            setError(
                              err.message || "Failed to update group name"
                            );
                          } finally {
                            setUpdatingName(false);
                          }
                        }}
                        disabled={updatingName || !newGroupName.trim()}
                        className="p-1 text-indigo-600 hover:text-indigo-700 disabled:text-gray-400"
                      >
                        {updatingName ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingName(false);
                          setNewGroupName(groupName);
                        }}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {groupName}
                      </h2>
                      <button
                        onClick={() => {
                          setNewGroupName(groupName);
                          setIsEditingName(true);
                        }}
                        className="p-1 text-gray-500 hover:text-indigo-600 transition-colors"
                        title="Edit Group Name"
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-400"></span>
                    {groupDetails?.participants?.length} participants
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowParticipants(!showParticipants)}
                  className="p-3 text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  title="View Participants"
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setShowAddParticipants(true)}
                  className="p-3 text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  title="Add Participants"
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
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => navigate("/allchats")}
                  className="p-3 text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  title="Back to Chats"
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
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {showParticipants && (
              <div className="p-4 bg-gray-50 border-b border-gray-200 animate-fadeIn">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Participants
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {groupDetails?.participants?.map((participant) => (
                    <div
                      key={participant._id}
                      className="flex items-center space-x-2 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white text-sm font-semibold">
                              {participant.username[0].toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-700 truncate">
                            {participant.username}
                          </span>
                        </div>
                        {participant._id !== user._id && (
                          <button
                            onClick={() =>
                              handleRemoveParticipant(participant._id)
                            }
                            className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Remove Participant"
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
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showAddParticipants && (
              <div className="p-4 bg-gray-50 border-b border-gray-200 animate-fadeIn">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Add Participants
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {onlineUsers
                    .filter(
                      (user) =>
                        !groupDetails?.participants?.some(
                          (p) => p._id === user._id
                        )
                    )
                    .map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center space-x-2 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                              <span className="text-white text-sm font-semibold">
                                {user.username[0].toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-700 truncate">
                              {user.username}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              if (selectedUsersToAdd.includes(user._id)) {
                                setSelectedUsersToAdd(
                                  selectedUsersToAdd.filter(
                                    (id) => id !== user._id
                                  )
                                );
                              } else {
                                setSelectedUsersToAdd([
                                  ...selectedUsersToAdd,
                                  user._id,
                                ]);
                              }
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              selectedUsersToAdd.includes(user._id)
                                ? "text-indigo-600 bg-indigo-50"
                                : "text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                            }`}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {selectedUsersToAdd.includes(user._id) ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              ) : (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 4v16m8-8H4"
                                />
                              )}
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowAddParticipants(false);
                      setSelectedUsersToAdd([]);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddParticipants}
                    disabled={
                      selectedUsersToAdd.length === 0 || addingParticipant
                    }
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingParticipant ? "Adding..." : "Add Selected"}
                  </button>
                </div>
              </div>
            )}

            {/* Message display section */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
              {[...messages].reverse().map((message) => (
                <div
                  key={message._id}
                  className={`flex ${
                    message.sender._id === user._id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.sender._id === user._id
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {message.sender.username}
                      </span>
                      <span className="text-xs opacity-75">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="break-words">{message.content}</p>
                    {message.sender._id === user._id && (
                      <div className="flex justify-end mt-1">
                        <button
                          onClick={() => handleDeleteMessage(message._id)}
                          className="text-xs opacity-70 hover:opacity-100 transition-opacity"
                          title="Delete Message"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Message input section */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  disabled={sendingMessage}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sendingMessage}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {sendingMessage ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    "Send"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
