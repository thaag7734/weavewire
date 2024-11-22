import React, { type FormEvent, useEffect, useState } from "react";
import { csrfFetch } from "../../util/csrfFetch";
import { useAppDispatch, useAppSelector } from "../../redux/util";
import { getRecentPosts, selectAllPosts } from "../../redux/reducers/posts";
import CarouselCard from "./CarouselCard";
import "./SplashPage.css";

export default function SplashPage() {
  const posts = useAppSelector(state => selectAllPosts(state));
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getRecentPosts());
  }, [])

  const handleLogin = async (e: FormEvent) => {
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

  const handleAnimEnd = (e: React.AnimationEvent) => {
    const target = e.currentTarget;

    e.currentTarget.parentElement?.appendChild(target)
  }

  return (
    <div className="splash">
      <div className="carousel-group" onAnimationEnd={handleAnimEnd}>
        <div className="carousel">
          {posts.map((post) =>
            <CarouselCard key={post.id} postId={post.id} />
          )}
        </div>
        <div className="carousel">
          {posts.map((post) =>
            <CarouselCard key={post.id} postId={post.id} />
          )}
        </div>
      </div>
      <div className="splash-cta-group">
        <div className="splash-cta">
          <h1>Weavewire</h1>
          <p>ermmmmm make an account, stinky</p>
        </div>
        <div className="splash-login card">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="input">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                />
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                />
              </div>
            </div>
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
}
