import { useAppSelector } from "../../redux/util";
import "./Sidebar.css";
import { ASSET_URL, AVATAR_URL } from "../../appConfig";
import { useLocation, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const user = useAppSelector((state) => state.session.user);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="sidebar">
      <div className="user-summary">
        <div className="summary-pfp pfp">
          {user && (
            <img
              alt=""
              className="pfp"
              src={`${AVATAR_URL}/${user.avatar || "nopfp.png"}`}
            />
          )}
        </div>
        <div className="summary-text">
          {user && (
            <>
              <button
                type="button"
                className="username"
                onClick={() => alert("Profile page not yet implemented")}
              >
                {user.username}
              </button>
              <span className="summary-status">{user.status}</span>
            </>
          )}
        </div>
      </div>
      <img alt="" className="hr" src={`${ASSET_URL}/hr.svg`} />
      <nav>
        <div className="nav-top">
          <button
            type="button"
            onClick={() => alert("Popular posts feed not yet implemented")}
          >
            Popular
          </button>
          <button type="button" onClick={() => navigate("/feed")}>
            All Posts
          </button>
          <button
            type="button"
            onClick={() => alert("Subscriptions not yet implemented")}
          >
            Subscriptions
          </button>
          <button
            type="button"
            onClick={() => alert("Chat not yet implemented")}
          >
            Chat
          </button>
        </div>
        {location.pathname !== "/new_post" ? (
          <div className="nav-btm">
            <button
              type="button"
              className="new-post-btn"
              onClick={() => navigate("/new_post")}
            >
              New Post
            </button>
          </div>
        ) : null}
      </nav>
    </div>
  );
}
