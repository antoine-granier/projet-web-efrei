import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import LayoutPage from "./Pages/LayoutPage";
import { useAuth0 } from "@auth0/auth0-react";
import Login from "./Pages/Login";

function App() {
  const { isAuthenticated } = useAuth0();

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
      path: "/",
      element: isAuthenticated ? <LayoutPage modules={modules} /> : <Login />,
      children: [
        {
          path: "",
          element: <Navigate to="home" />,
        },
        ...modules,
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
