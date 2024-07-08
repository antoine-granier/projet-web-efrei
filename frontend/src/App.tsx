import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import LayoutPage from "./Pages/LayoutPage";

function App() {
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
      element: <div>Login</div>,
    },
    {
      path: "/register",
      element: <div>Register</div>,
    },
    {
      path: "/",
      element: true ? (
        <LayoutPage modules={modules} />
      ) : (
        <Navigate to="/login" />
      ),
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
