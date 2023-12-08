import { useContext, useEffect, useState } from "react";
import useSWR from "swr";
import { Context, User } from "../Context";
import { useNavigate } from "react-router-dom";

export function UserChooser() {
  const { data, error, isLoading } = useSWR<User[]>("/users");

  const [chosenUser, setChosenUser] = useState<User | null>(null);

  const ctx = useContext(Context);
  const navigate = useNavigate();

  useEffect(() => {
    if (ctx.loggedIn) {
      navigate("/threads");
    }
  }, [ctx, navigate]);

  if (error) {
    return <p>{error.toString()}</p>;
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      {data?.map((user) => (
        <label key={user.id}>
          <input
            type="radio"
            checked={user.id === chosenUser?.id}
            onChange={(ev) => {
              if (ev.target.checked) {
                setChosenUser(user);
              }
            }}
          />{" "}
          {user.name}
        </label>
      ))}
      <button
        disabled={!chosenUser}
        onClick={() => chosenUser && ctx.setUser(chosenUser)}
      >
        Log in
      </button>
    </div>
  );
}
