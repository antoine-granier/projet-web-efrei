import { Alert, Button, Label, Modal } from "flowbite-react";
import React, { useState } from "react";
import Select, { StylesConfig } from "react-select";
import { useUserStore } from "../store/userStore";
import { gql, useApolloClient, useMutation, useQuery } from "@apollo/client";
import { AddUserDocument, GetUsersDocument } from "../__generated__/graphql";
import { toast } from "sonner";

// @ts-ignore
const ADD_USER_TO_CHAT = gql`
  mutation addUser($userId: String!, $chatId: String!) {
    addUser(userId: $userId, chatId: $chatId) {
      id
      users {
        id
        name
        email
      }
    }
  }
`;

type User = {
  id: string;
  name: string;
};

type AddUserModaltModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  chatId: string;
  chatUsers: User[];
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

const AddUserModal: React.FC<AddUserModaltModalProps> = ({
  open,
  setOpen,
  chatId,
  chatUsers,
}) => {
  const [userToAdd, setUser] = useState<UserOption>();
  const user = useUserStore((state) => state.user);

  const client = useApolloClient();

  const { data, loading } = useQuery(GetUsersDocument);
  const [addUser, { loading: addLoading, error: addError }] = useMutation(
    AddUserDocument,
    {
      variables: {
        chatId: chatId,
        userId: userToAdd?.value || "",
      },
    }
  );

  return (
    <Modal dismissible show={open} onClose={() => setOpen(false)}>
      <Modal.Header>Add user to chat</Modal.Header>
      <div className="p-6">
        <Alert color="info" className="mb-4">
          <span>Choose user you want to add in the chat.</span>
        </Alert>
        <Label>
          Users :
          <Select
            styles={customStyles}
            options={
              data?.getUsers
                .filter(
                  (u) =>
                    u.id !== user?.id && !chatUsers.find((cu) => cu.id === u.id)
                )
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
            onChange={(val) => setUser(val as any)}
          />
        </Label>
      </div>
      <Modal.Footer className="flex justify-end">
        <Button color="red" onClick={() => setOpen(false)}>
          Decline
        </Button>
        <Button
          disabled={addLoading}
          isProcessing={addLoading}
          onClick={async () => {
            if (!userToAdd) {
              toast.info("You need to choose at least one user.");
              return;
            }
            await addUser();
            if (addError) {
              toast.error("Error during add user. Try later...");
            } else {
              await client.refetchQueries({
                include: ["getChatsByUser", "getChatById"],
              });
              setOpen(false);
            }
          }}
        >
          Add
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddUserModal;
