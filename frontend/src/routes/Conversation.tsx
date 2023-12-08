import { useParams } from "react-router-dom";
import { MessageBubble } from "../components/MessageBubble";
import useSWR from "swr";
import { Context, Message } from "../Context";
import { useContext, useState } from "react";
import useSWRMutation from "swr/mutation";

export function Conversation() {
  const { userId } = useParams<{ userId: string }>();

  const { data } = useSWR<Message[]>(`/api/conversation/${userId}`);
  const ctx = useContext(Context);

  const [inputMessage, setInputMessage] = useState("");

  if (!("user" in ctx)) {
    return;
  }

  const messages = new Map([
    ...(data ?? []).map<[string, Message]>((msg) => [msg.id, msg]),
    ...(ctx.socketMessages[userId!] ?? []).map<[string, Message]>((msg) => [
      msg.id,
      msg,
    ]),
  ]);

  return (
    <div>
      {Array.from(messages.values()).map((message) => (
        <MessageBubble
          key={message.id}
          $type={message.senderId === ctx.user.id ? "sender" : "receiver"}
        >
          {message.content}
        </MessageBubble>
      ))}
      <input
        type="text"
        value={inputMessage}
        onChange={(ev) => setInputMessage(ev.target.value)}
      />
      <button
        onClick={() => {
          fetch("/api/message", {
            method: "POST",
            headers: {
              "x-user-id": ctx.user.id,
              "content-type": "application/json",
            },
            body: JSON.stringify({ content: inputMessage, receiverId: userId }),
          }).then((res) => res.json());
          setInputMessage("");
        }}
      >
        Send message
      </button>
    </div>
  );
}
