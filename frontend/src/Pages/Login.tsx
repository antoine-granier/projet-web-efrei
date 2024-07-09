import { gql, useMutation } from "@apollo/client";
import { SyntheticEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/userStore";
import { toast } from "sonner";
import { Button, TextInput } from "flowbite-react";

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
      id
      name
      email
      token
    }
  }
`;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { loading, error }] = useMutation(LOGIN_MUTATION);
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      const response = await login({ variables: { email, password } });
      if (response.data?.signIn?.token) {
        setUser({
          id: response.data.signIn.id,
          name: response.data.signIn.name,
          email: response.data.signIn.email,
          token: response.data.signIn.token,
        });
        navigate("/");
      } else {
        toast.error("Error during connection");
      }
    } catch (err) {
      toast.error("Error during connection");
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email:
          </label>
          <TextInput
            type="email"
            id="email"
            placeholder="Email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password:
          </label>
          <TextInput
            type="password"
            id="password"
            placeholder="Password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button
            color="red"
            type="button"
            onClick={() => {
              setEmail("");
              setPassword("");
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} isProcessing={loading}>
            Connection
          </Button>
        </div>
        {error && (
          <p className="mt-2 text-center text-sm text-red-600">
            Error during connection.
          </p>
        )}
      </form>
      <p className="text-center py-4">No account?</p>
      <div className="flex justify-center">
        <Button onClick={() => navigate("/register")}>Sign up</Button>
      </div>
    </div>
  );
};

export default Login;
