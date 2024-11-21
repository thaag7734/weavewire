import { type FormEvent, useEffect, useState } from "react";
import { csrfFetch } from "../../util/csrfFetch";

export default function SplashPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    await csrfFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
      headers: { "Content-Type": "application/json" },
    });
  };

  return (
    <form method="POST" onSubmit={handleSubmit}>
      <input
        type="text"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
        placeholder="email"
      />
      <input
        type="text"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
        placeholder="password"
      />
      <button type="submit">Submit</button>
    </form>
  );
}
