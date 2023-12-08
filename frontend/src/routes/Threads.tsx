import useSWR from "swr";
import { Link } from "react-router-dom";

export function Threads() {
  const { data } =
    useSWR<{ id: string; name: string; latestMessageContent: string }[]>(
      "/api/threads",
    );

  return (
    <ul>
      {data?.map((thread) => (
        <li key={thread.id}>
          <Link to={`/conversation/${thread.id}`}>
            {thread.name}: {thread.latestMessageContent}
          </Link>
        </li>
      ))}
    </ul>
  );
}
