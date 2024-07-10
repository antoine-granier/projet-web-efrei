import { gql, useApolloClient, useMutation, useQuery } from "@apollo/client";
import { Button, Spinner, TextInput } from "flowbite-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AddMessageToChatDocument,
  GetChatByIdDocument,
  RemoveUserDocument,
} from "../__generated__/graphql";
import { useUserStore } from "../store/userStore";
import Message from "../components/Message";
import {
  IoIosPeople,
  IoIosPersonAdd,
  IoIosTrash,
  IoMdSend,
} from "react-icons/io";
import { KeyboardEventHandler, useEffect, useState } from "react";
import { toast } from "sonner";
import { createSocket } from "../socket";
import AddUserModal from "../components/AddUserModal";

// @ts-ignore
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

// @ts-ignore
const ADD_MESSAGE_TO_CHAT = gql`
  mutation addMessageToChat(
    $chatId: String!
    $message: String!
    $author: String!
  ) {
    addMessageToChat(chatId: $chatId, message: $message, author: $author)
  }
`;

// @ts-ignore
const REMOVE_USER_FROM_CHAT = gql`
  mutation removeUser($userId: String!, $chatId: String!) {
    removeUser(userId: $userId, chatId: $chatId) {
      id
      users {
        id
        name
        email
      }
    }
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
  const client = useApolloClient();
  const { id } = useParams();
  const user = useUserStore((state) => state.user);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(GetChatByIdDocument, {
    variables: { chatId: id || "" },
    pollInterval: 500,
  });

  const [addMessage] = useMutation(AddMessageToChatDocument, {
    variables: {
      chatId: id || "",
      message,
      author: user?.id || "",
    },
  });

  const [removeUser] = useMutation(RemoveUserDocument, {
    variables: {
      chatId: id || "",
      userId: user?.id || "",
    },
  });

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

      socket.on("message", (data: Message) => {
        setMessages((prevMessages) => [...prevMessages, data]);
      });

      return () => {
        socket.off("connect");
        socket.off("message");
        socket.disconnect();
      };
    }
  }, [user, id]);

  useEffect(() => {
    if (data && data.getChatById.messages.length > 0) {
      setMessages(data.getChatById.messages);
    } else {
      setMessages([]);
    }
  }, [data]);

  const sendMessage = async () => {
    return addMessage();
  };

  const onSubmit = () => {
    if (message.length <= 0) return toast.info("Message can't be empty.");
    toast.promise(sendMessage, {
      loading: "Sending message...",
      success: async () => {
        setMessage("");
        return `Message sent.`;
      },
      error: "Error. Try later...",
    });
  };

  const handleKeyDown: KeyboardEventHandler = (event) => {
    if (event.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div key={id}>
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
        <div className="flex gap-1">
          <Button size="xs" onClick={() => setOpen(!open)}>
            <IoIosPersonAdd className="w-6 h-6" />
          </Button>
          <Button
            size="xs"
            color="red"
            onClick={async () => {
              await removeUser();
              await client.refetchQueries({
                include: ["getChatsByUser"],
              });
              navigate("/");
            }}
          >
            <IoIosTrash className="w-6 h-6" />
          </Button>
        </div>
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
          onKeyDown={handleKeyDown}
        />
        <Button
          onClick={async () => {
            onSubmit();
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
