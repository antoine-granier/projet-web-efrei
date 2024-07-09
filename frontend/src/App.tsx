import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import LayoutPage from "./Pages/LayoutPage";
import Login from "./Pages/Login";
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { useUserStore } from "./store/userStore";
import Register from "./Pages/Register";

function App() {
  const { user, setUser } = useUserStore();

  const httpLink = new HttpLink({ uri: import.meta.env.VITE_API_URL });

  const authLink = new ApolloLink((operation, forward) => {
    operation.setContext({
      headers: {
        authorization: user?.token ? `Bearer ${user.token}` : "",
      },
    });

    return forward(operation);
  });

  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeoutDelayBrowser = 2147483647;
  const token = user?.token;

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      const time = new Date().getTime();

      if (decoded.exp) {
        const expirationTime = decoded.exp * 1000 - time;
        timeoutRef.current = setTimeout(
          () => {
            setUser(null);
          },
          expirationTime > maxTimeoutDelayBrowser
            ? maxTimeoutDelayBrowser
            : expirationTime
        );
      }
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user, setUser, user?.token]);

  const modules = [
    {
      path: "home",
      element: <div>home</div>,
      title: "Home",
    },
  ];

  const router = createBrowserRouter([
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/",
      element: user?.token ? <LayoutPage /> : <Navigate to="/login" />,
      children: [
        {
          path: "",
          element: <Navigate to="home" />,
        },
        ...modules,
      ],
    },
  ]);

  return (
    <ApolloProvider client={client}>
      <RouterProvider router={router} />
    </ApolloProvider>
  );
}

export default App;
