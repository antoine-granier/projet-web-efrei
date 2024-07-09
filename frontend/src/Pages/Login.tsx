import { useAuth0 } from "@auth0/auth0-react";

const Login = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <div>
      <h1>Connexion</h1>
      <button onClick={() => loginWithRedirect()}>Se connecter</button>
    </div>
  );
};

export default Login;
