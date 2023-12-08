import {
  PropsWithChildren,
  createContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { SWRConfig } from "swr";

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  receiverId: string;
  senderId: string;
}

export interface User {
  id: string;
  name: string;
}

interface LoggedIn {
  user: User;
  socketMessages: Record<string, Message[]>;
}

interface Always {
  setUser: (user: User) => void;
  loggedIn: boolean;
}

export const Context = createContext<Always | (LoggedIn & Always)>({
  setUser: () => {},
  loggedIn: false,
});

export function ContextProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User>();

  const [socketMessages, setSocketMessages] = useState<
    Record<string, Message[]>
  >({});

  const userIdRef = useRef(user?.id);
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    if (userIdRef.current !== user?.id) {
      setSocketMessages({});
    }
    userIdRef.current = user?.id;

    let unmountClosed = false;
    let ws: WebSocket;
    const connect = () => {
      ws = new WebSocket("wss://localhost/ws/");

      ws.addEventListener("message", (event) => {
        const { type, data } = JSON.parse(event.data);

        switch (type) {
          case "message":
            setSocketMessages((_existing) => ({
              ..._existing,
              [data.senderId === user.id ? data.receiverId : data.senderId]: [
                ...(_existing[
                  data.senderId === user.id ? data.receiverId : data.senderId
                ] ?? []),
                data,
              ],
            }));
            break;
        }
      });

      ws.addEventListener("close", () => {
        if (unmountClosed) return;

        setTimeout(() => connect(), 500);
      });

      ws.addEventListener("open", () => {
        ws.send(JSON.stringify({ type: "login", data: user?.id }));
      });
    };

    connect();

    return () => {
      unmountClosed = true;
      ws?.close();
    };
  }, [user]);

  return (
    <Context.Provider
      value={{ user, setUser, socketMessages, loggedIn: !!user }}
    >
      <SWRConfig
        value={{
          fetcher: (resource: string, init?: RequestInit) =>
            fetch(resource, {
              ...(init ?? {}),
              headers: {
                ...(init?.headers ?? {}),
                ...(user ? { "x-user-id": user.id } : {}),
              },
            }).then((res) => res.json()),
        }}
      >
        {children}
      </SWRConfig>
    </Context.Provider>
  );
}
