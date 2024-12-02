import type React from "react";
import { type FormEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/util";
import { getRecentPosts, selectOrderedPosts } from "../../redux/reducers/posts";
import CarouselCard from "./CarouselCard";
import "./SplashPage.css";
import { login, register, restoreUser } from "../../redux/reducers/session";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../ErrorMessage/ErrorMessage";

export default function SplashPage() {
  const posts = useAppSelector((state) => selectOrderedPosts(state));
  const user = useAppSelector((state) => state.session.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignupForm, setIsSignupForm] = useState(false);
  const [errors, setErrors] = useState<
    Record<string, ReturnType<typeof ErrorMessage>[]>
  >({});
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/feed");
  }, [user, navigate]);

  useEffect(() => {
    dispatch(restoreUser());
    dispatch(getRecentPosts());
  }, [dispatch]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    const thunk = isSignupForm
      ? register({
        username,
        email,
        password,
        password_confirmation: confirmPassword,
      })
      : login({ email, password });

    dispatch(thunk).then((action) => {
      if (
        ["session/login/rejected", "session/register/rejected"].includes(
          action.type,
        )
      ) {
        const errors: Record<string, ReturnType<typeof ErrorMessage>[]> = {};

        for (const [k, v] of Object.entries(
          action.payload as Record<string, string[]>,
        )) {
          errors[k] = v.map((msg) => <ErrorMessage key={msg} msg={msg} />);
        }
        setErrors(errors);
      }
    });
  };

  const handleAnimEnd = (e: React.AnimationEvent) => {
    const target = e.currentTarget;

    e.currentTarget.parentElement?.appendChild(target);
  };

  const demoLogin = () => {
    dispatch(login({ email: "demo@tylerhaag.dev", password: "password" }));
  };

  const toggleSignup = (e: React.MouseEvent) => {
    // if i don't put these here it tries to submit the form and only god knows why
    e.preventDefault();
    e.stopPropagation();

    setIsSignupForm((prev) => !prev);
  };

  return (
    <div className="splash">
      <div className="carousel-group" onAnimationEnd={handleAnimEnd}>
        <div className="carousel">
          {posts.map((post) => (
            <CarouselCard key={post.id} postId={post.id} />
          ))}
        </div>
        <div className="carousel">
          {posts.map((post) => (
            <CarouselCard key={post.id} postId={post.id} />
          ))}
        </div>
      </div>
      <div className="splash-cta-group">
        <div className="splash-cta">
          <h1>Enter the Weave.</h1>
          <p>
            A canvas of memories and moments awaits you on Weavewire, where each
            interaction contributes to a tapestry of shared experiences.
            Discover, create, and connect with others who are shaping their
            stories in this virtual community.
          </p>
        </div>
        <div className="splash-login card">
          <h2>{isSignupForm ? "Register" : "Login"}</h2>
          <form onSubmit={handleLogin}>
            {isSignupForm ? (
              <>
                {errors.username}
                <div className="input-group">
                  <label htmlFor="username">Username</label>
                  <div className="input">
                    <input
                      name="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.currentTarget.value)}
                    />
                  </div>
                </div>
              </>
            ) : null}
            {errors.email}
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="input">
                <input
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                />
              </div>
            </div>
            {errors.password}
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input">
                <input
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                />
              </div>
            </div>
            {isSignupForm ? (
              <>
                {errors.confirmPassword ?? errors.password_confirmation}
                <div className="input-group">
                  <label htmlFor="confirm-password">Password</label>
                  <div className="input">
                    <input
                      name="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.currentTarget.value)
                      }
                    />
                  </div>
                </div>
              </>
            ) : null}
            <div className="login-signup-group">
              <button
                type="submit"
                className="register-cta"
                onClick={toggleSignup}
              >
                {isSignupForm
                  ? "Already have an account?"
                  : "Don't have an account yet?"}
              </button>
              <button type="submit">
                {isSignupForm ? "Register" : "Login"}
              </button>
            </div>
            <button type="button" className="demo-login" onClick={demoLogin}>
              Login as Demo User
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
