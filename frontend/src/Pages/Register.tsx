import { gql, useMutation } from "@apollo/client";
import { Button, TextInput } from "flowbite-react";
import { SyntheticEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const REGISTER_MUTATION = gql`
  mutation signUp($name: String!, $email: String!, $password: String!) {
    signUp(name: $name, email: $email, password: $password) {
      message
      success
    }
  }
`;

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [register, { loading, error }] = useMutation(REGISTER_MUTATION);
  const navigate = useNavigate();

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (password !== confirmPassword)
      return toast.error("Password should be equals to confirm password");
    try {
      const response = await register({
        variables: { name: name, email, password },
      });
      if (response.data?.signUp?.success) {
        navigate("/login");
      }
    } catch (err) {
      console.error("Error during connection:", err);
      toast.error("Error during connection. Try later...");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-6">
      <div className="flex flex-col">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Name:
        </label>
        <TextInput
          type="text"
          id="name"
          placeholder="Name..."
          onChange={(e) => setName(e.target.value)}
        />
      </div>
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
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="flex flex-col">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700"
        >
          Confirm password:
        </label>
        <TextInput
          type="password"
          id="confirmPassword"
          placeholder="Confirm password..."
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={loading} isProcessing={loading}>
          Sign up
        </Button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">
          Error during sign up.
        </p>
      )}
    </form>
  );
};

export default Register;
