import { FaSquarePlus } from "react-icons/fa6";
import "./PostCreator.css";
import "../Feed/PostCard.css";
import { ReactElement, useEffect, useState } from "react";
import ErrorMessage from "../ErrorMessage/ErrorMessage";

export default function PostCreator() {
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<ReactElement | null>(null);

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCap = e.currentTarget.value;

    if (newCap.length > 512) {
      e.currentTarget.parentElement!.classList.add("error");
      setError(<ErrorMessage msg="Caption cannot exceed 512 characters" />);
    } else {
      e.currentTarget.parentElement!.classList.remove("error");
      setError(null);
    }

    setCaption(newCap);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  return (
    <div className="post-creator">
      <div className="card post-card new-post-card">
        <button type="button" className="post-card-img" title="Upload image">
          <FaSquarePlus />
        </button>
        <div className="post-details">
          <div className="input">
            <textarea
              className="caption-field"
              placeholder="Enter a caption"
              onChange={handleCaptionChange}
              value={caption}
            />
          </div>
        </div>
        <div className="new-post-controls">
          {error}
          <button className="submit-post" type="submit" onClick={handleSubmit}>
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
