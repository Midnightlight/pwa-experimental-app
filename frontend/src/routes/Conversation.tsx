import { MessageBubble } from "../components/MessageBubble";

export function Conversation() {
  return (
    <div>
      <MessageBubble $type="receiver">Hello!</MessageBubble>
      <MessageBubble $type="sender">Hi there!</MessageBubble>
    </div>
  );
}
