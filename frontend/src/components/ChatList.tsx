import { gql, useQuery } from "@apollo/client";
import { useUserStore } from "../store/userStore";
import { Spinner } from "flowbite-react";
import { GetChatsByUserDocument } from "../__generated__/graphql";
import { IoIosChatbubbles } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { twMerge } from "tailwind-merge";

// @ts-ignore
const GET_CHAT_BY_USER = gql`
  query getChatsByUser($userId: String!) {
    getChatsByUser(userId: $userId) {
      id
      users {
        id
        name
      }
      messages {
        author {
          id
          email
          name
        }
        content
      }
    }
  }
`;

const ChatList = () => {
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, loading, error } = useQuery(GetChatsByUserDocument, {
    variables: { userId: user?.id || "" },
    pollInterval: 500,
  });

  return (
    <div className="w-full flex flex-col items-center">
      <p className="text-lg font-bold p-2">Chats</p>
      {error && <p>Error during loading chat.</p>}
      {loading ? (
        <Spinner />
      ) : (
        <div className="w-full flex flex-col">
          {data?.getChatsByUser && data.getChatsByUser.length > 0 ? (
            data.getChatsByUser.map((chat) => {
              return (
                <div
                  key={chat.id}
                  className={twMerge(
                    "flex items-center justify-between p-2 gap-2 border-b cursor-pointer",
                    chat.id === id
                      ? "bg-[#0d7490] text-white"
                      : "bg-white hover:bg-slate-200"
                  )}
                  onClick={() => navigate(chat.id)}
                >
                  <IoIosChatbubbles className="h-8 w-8" />
                  <div className="w-full flex flex-col gap-1">
                    <p className="truncate">
                      {chat.users.map((user, index) => {
                        if (index === chat.users.length - 1) {
                          return user.name;
                        }
                        return user.name + ", ";
                      })}
                    </p>
                    {chat.messages.length > 0 ? (
                      <p
                        className={twMerge(
                          "text-sm",
                          chat.id === id ? "text-slate-50" : "text-gray-500"
                        )}
                      >
                        {chat.messages[chat.messages.length - 1].content}
                      </p>
                    ) : (
                      <p
                        className={twMerge(
                          "text-sm",
                          chat.id === id ? "text-slate-50" : "text-gray-500"
                        )}
                      >
                        No message.
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-center">No chat</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatList;
