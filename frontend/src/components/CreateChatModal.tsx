import { gql, useApolloClient, useMutation, useQuery } from "@apollo/client";
import { CreateChatDocument, GetUsersDocument } from "../__generated__/graphql";
import React, { useState } from "react";
import { Alert, Button, Label, Modal } from "flowbite-react";
import Select, { MultiValue, StylesConfig } from "react-select";
import { toast } from "sonner";
import { useUserStore } from "../store/userStore";

const CREATE_CHAT = gql`
  mutation createChat($userIds: [String!]!) {
    createChat(userIds: $userIds) {
      id
      users {
        id
      }
    }
  }
`;

const GET_USERS = gql`
  query getUsers {
    getUsers {
      id
      name
      email
    }
  }
`;

type CreateChatModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

type UserOption = {
  label: string;
  value: string;
};

const customStyles: StylesConfig<UserOption, true> = {
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
  }),
};

const CreateChatModal: React.FC<CreateChatModalProps> = ({ open, setOpen }) => {
  const [users, setUsers] = useState<MultiValue<UserOption>>([]);
  const user = useUserStore((state) => state.user);

  const client = useApolloClient();

  const { data, loading } = useQuery(GetUsersDocument);
  const [createChat, { loading: createLoading, error: createError }] =
    useMutation(CreateChatDocument, {
      variables: {
        userIds: [...users.map((user) => user.value), user?.id ? user.id : ""],
      },
    });

  return (
    <Modal dismissible show={open} onClose={() => setOpen(false)}>
      <Modal.Header>Create chat</Modal.Header>
      <div className="p-6">
        <Alert color="info" className="mb-4">
          <span>Choose users you want to add in the chat.</span>
        </Alert>
        <Label>
          Users :
          <Select
            styles={customStyles}
            options={
              data?.getUsers
                .filter((u) => u.id !== user?.id)
                .map((user) => {
                  return {
                    label: user.name,
                    value: user.id,
                  };
                }) || []
            }
            isLoading={loading}
            isClearable
            isDisabled={loading}
            isMulti
            onChange={(val) => setUsers(val)}
          />
        </Label>
      </div>
      <Modal.Footer className="flex justify-end">
        <Button color="red" onClick={() => setOpen(false)}>
          Decline
        </Button>
        <Button
          disabled={createLoading}
          isProcessing={createLoading}
          onClick={async () => {
            if (users.length <= 0) {
              toast.info("You need to choose at least one user.");
              return;
            }
            await createChat();
            if (createError) {
              toast.error("Error during chat creation. Try later...");
            } else {
              await client.refetchQueries({
                include: ["getChatsByUser"],
              });
              setOpen(false);
            }
          }}
        >
          Create
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateChatModal;
