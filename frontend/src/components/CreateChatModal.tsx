import { gql, useMutation, useQuery } from "@apollo/client";
import { GetUsersDocument } from "../__generated__/graphql";
import React, { useState } from "react";
import { Button, Label, Modal } from "flowbite-react";
import Select from "react-select";

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

const CreateChatModal: React.FC<CreateChatModalProps> = ({ open, setOpen }) => {
  const [userIds, setUserIds] = useState([]);

  const { data, loading, error } = useQuery(GetUsersDocument);
  const [createChat, { loading: createLoading, error: errorLoading }] =
    useMutation(CREATE_CHAT, {
      variables: { userIds: userIds },
    });

  return (
    <Modal dismissible show={open} onClose={() => setOpen(false)}>
      <Modal.Header>Create chat</Modal.Header>
      <Modal.Body>
        <div className="space-y-6">
          <Label>
            Users :
            <Select
              options={
                data?.getUsers.map((user) => {
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
              onChange={(val) => console.log(val)}
            />
          </Label>
        </div>
      </Modal.Body>
      <Modal.Footer className="flex justify-end">
        <Button color="red" onClick={() => setOpen(false)}>
          Decline
        </Button>
        <Button
          onClick={async () => {
            await createChat();
            setOpen(false);
          }}
        >
          Create
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateChatModal;
