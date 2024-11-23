import { useAppSelector } from "../../redux/util";
import "./Sidebar.css";
import { ASSET_URL, AVATAR_URL } from "../../appConfig";

export default function Sidebar() {
  const user = useAppSelector(state => state.session.user);

  return (
    <div className="sidebar">
      <div className="user-summary">
        <div className="summary-pfp pfp">
          {user && <img className="pfp" src={`${AVATAR_URL}/${user.avatar || "nopfp.png"}`} />}
        </div>
        <div className="summary-text">
          {user && (
            <>
              <h4>{user.username}</h4>
              <span className="summary-status">{user.status}</span>
            </>
          )}
        </div>
      </div>
      <img className="hr" src={`${ASSET_URL}/hr.svg`} />
    </div>
  )
}
