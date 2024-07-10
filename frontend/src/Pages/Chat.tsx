import { gql, useMutation, useQuery } from "@apollo/client";
import { Button, Spinner, TextInput } from "flowbite-react";
import { useParams } from "react-router-dom";
import {
  AddMessageToChatDocument,
  GetChatByIdDocument,
} from "../__generated__/graphql";
import { useUserStore } from "../store/userStore";
import Message from "../components/Message";
import { IoIosPeople, IoIosPersonAdd, IoMdSend } from "react-icons/io";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createSocket } from "../socket";
import AddUserModal from "../components/AddUserModal";

const GET_CHAT_BY_ID = gql`
  query getChatById($chatId: String!) {
    getChatById(chatId: $chatId) {
      id
      users {
        id
        name
      }
      messages {
        id
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

const ADD_MESSAGE_TO_CHAT = gql`
  mutation addMessageToChat(
    $chatId: String!
    $message: String!
    $author: String!
  ) {
    addMessageToChat(chatId: $chatId, message: $message, author: $author)
  }
`;

type Message = {
  __typename?: "Message" | undefined;
  id: string;
  content: string;
  author: {
    __typename?: "User" | undefined;
    id: string;
    email: string;
    name: string;
  };
};

const Chat = () => {
  const { id } = useParams();
  const user = useUserStore((state) => state.user);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [open, setOpen] = useState(false);

  const { data, loading, error } = useQuery(GetChatByIdDocument, {
    variables: { chatId: id || "" },
  });

  const [addMessage] = useMutation(AddMessageToChatDocument, {
    variables: {
      chatId: id || "",
      message,
      author: user?.id || "",
    },
  });

  const addMessageToList = (msg: Message) => {
    if (messages.find((message) => message.id === msg.id)) return;
    setMessages((prevMessages) => {
      if (prevMessages.find((message) => message.id === msg.id))
        return prevMessages;
      return [...prevMessages, msg];
    });
  };

  useEffect(() => {
    if (user && id) {
      const socket = createSocket(user.token);

      socket.connect();

      socket.on("connect", () => {
        socket.emit("join", {
          userId: user.id,
          chatId: id,
        });
      });

      socket.on("message", addMessageToList);
      return () => {
        socket.disconnect();
      };
    }
  }, [user, id]);

  useEffect(() => {
    if (data && data.getChatById.messages.length > 0) {
      setMessages(data.getChatById.messages);
    }
  }, [data]);

  const sendMessage = async () => {
    return addMessage();
  };

  return (
    <div>
      <div className="flex items-center justify-between border-b p-2">
        <div className="overflow-hidden flex items-center gap-1">
          <IoIosPeople className="w-6 h-6" />
          <p className="truncate">
            {data?.getChatById.users.map((user, index) => {
              if (index === data.getChatById.users.length - 1) {
                return user.name;
              }
              return user.name + ", ";
            })}
          </p>
        </div>
        <Button size="xs" onClick={() => setOpen(!open)}>
          <IoIosPersonAdd className="w-6 h-6" />
        </Button>
      </div>
      <div className="h-[calc(100vh-2rem-85px)] overflow-auto flex flex-col items-center">
        {loading ? (
          <Spinner />
        ) : error ? (
          <p>Error during messages loading.</p>
        ) : messages.length <= 0 ? (
          <p>No message.</p>
        ) : (
          messages.map((message, index) => {
            return (
              <Message
                key={index}
                author={message.author.name}
                content={message.content}
                variant={user?.id === message.author.id ? "right" : "left"}
              />
            );
          })
        )}
      </div>
      <div className="w-full flex items-center gap-2 p-1 border-t">
        <TextInput
          className="w-full"
          placeholder="Write something..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button
          onClick={async () => {
            if (message.length <= 0) {
              return toast.warning("Message can't be empty.");
            }
            toast.promise(sendMessage, {
              loading: "Sending message...",
              success: () => {
                setMessage("");
                return `Message send.`;
              },
              error: "Error. Try later...",
            });
          }}
        >
          <IoMdSend />
        </Button>
      </div>
      <AddUserModal
        open={open}
        setOpen={setOpen}
        chatId={data?.getChatById?.id || ""}
        chatUsers={data?.getChatById.users || []}
      />
    </div>
  );
};

export default Chat;