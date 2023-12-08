import { createGlobalStyle } from "styled-components";
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useNavigate,
} from "react-router-dom";
import { Conversation } from "./routes/Conversation";
import { UserChooser } from "./routes/UserChooser";
import { Context, ContextProvider } from "./Context";
import { Threads } from "./routes/Threads";
import { useContext, useEffect } from "react";

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  }

  body {
    background-color: #ece5dd;
  }
`;

function Authed() {
  const ctx = useContext(Context);
  const navigate = useNavigate();

  useEffect(() => {
    if (!ctx.loggedIn) {
      navigate("/");
    }
  }, [ctx]);

  return <Outlet />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <UserChooser />,
  },
  {
    element: <Authed />,
    children: [
      {
        path: "/conversation/:userId",
        element: <Conversation />,
      },
      {
        path: "/threads",
        element: <Threads />,
      },
    ],
  },
]);

export function App() {
  return (
    <ContextProvider>
      <GlobalStyle />
      <RouterProvider router={router} />
    </ContextProvider>
  );
}
