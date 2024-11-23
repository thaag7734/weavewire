import { useAppSelector } from "../../redux/util";
import "./Sidebar.css";

const HR_IMG_URL = "https://static.weavewire.tylerhaag.dev/assets/hr.svg";

export default function Sidebar() {
  const user = useAppSelector(state => state.session.user);

  return (
    <div className="sidebar">
      <div className="user-summary">
        <div className="summary-pfp pfp">
          {user && user.profile_image && <img className="pfp" src={user.profile_image} />}
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
      <img className="hr" src={HR_IMG_URL} />
    </div>
  )
}
