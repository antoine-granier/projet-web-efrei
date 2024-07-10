import { gql, useMutation, useQuery } from "@apollo/client";
import { Button, Spinner, TextInput } from "flowbite-react";
import { useParams } from "react-router-dom";
import {
  AddMessageToChatDocument,
  GetChatByIdDocument,
} from "../__generated__/graphql";
import { useUserStore } from "../store/userStore";
import Message from "../components/Message";
import { IoMdSend } from "react-icons/io";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { io } from "socket.io-client";
import { socket } from "../socket";

const GET_CHAT_BY_ID = gql`
  query getChatById($chatId: String!) {
    getChatById(chatId: $chatId) {
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

const ADD_MESSAGE_TO_CHAT = gql`
  mutation addMessageToChat(
    $chatId: String!
    $message: String!
    $author: String!
  ) {
    addMessageToChat(chatId: $chatId, message: $message, author: $author)
  }
`;

const Chat = () => {
  const { id } = useParams();
  const user = useUserStore((state) => state.user);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user && id) {
      socket.connect();

      socket.on("connect", () => {
        socket.emit("join", {
          userId: user.id,
          chatId: id,
        });
      });

      socket.on("message", (data) => {
        console.log(data);
      });
    }

    return () => {
      socket.disconnect();
    };
  }, []);

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

  const sendMessage = async () => {
    return addMessage();
  };

  return (
    <div>
      <div className="h-[calc(100vh-2rem-50px)] overflow-auto flex flex-col items-center">
        {loading ? (
          <Spinner />
        ) : error ? (
          <p>Error during messages loading.</p>
        ) : !data || data.getChatById.messages.length <= 0 ? (
          <p>No message.</p>
        ) : (
          data.getChatById.messages.map((message, index) => {
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
      <div className="w-full flex items-center gap-2 p-1">
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
                return `Message send.`;
              },
              error: "Error. Try later...",
            });
          }}
        >
          <IoMdSend />
        </Button>
      </div>
    </div>
  );
};

export default Chat;
