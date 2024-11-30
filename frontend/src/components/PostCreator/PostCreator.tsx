import { FaSquarePlus } from "react-icons/fa6";
import "./PostCreator.css";
import "../Feed/PostCard.css";
import { type ReactElement, useRef, useState } from "react";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import { createPost } from "../../redux/reducers/posts";
import { useAppDispatch } from "../../redux/util";

export default function PostCreator() {
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<ReactElement | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [previewImageURL, setPreviewURL] = useState("");
  const fileInput = useRef<HTMLInputElement | null>(null);
  const dispatch = useAppDispatch();

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const supportedExtensions = [
      "apng",
      "avif",
      "gif",
      "jpg",
      "jpeg",
      "jfif",
      "pjpeg",
      "pjp",
      "png",
      "webp",
    ];

    if (e.currentTarget.files?.[0]) {
      const fileExt = e.currentTarget.files[0].name.split(".").slice(-1)[0];
      if (!supportedExtensions.includes(fileExt)) {
        e.preventDefault();
        setError(<ErrorMessage msg={"File must be an image"} />);
        return;
      }
      setImage(e.currentTarget.files[0]);
      setPreviewURL(URL.createObjectURL(e.currentTarget.files[0]));
    }
  };

  const upload = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    fileInput.current?.click();
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!image) return; // this is not really necessary

    const data = await dispatch(createPost({ image, caption }));

    // @ts-ignore
    if (data.message) {
      // @ts-ignore
      setError(<ErrorMessage msg={data.message} />);
    }
  };

  return (
    <div className="post-creator">
      <div className="card post-card new-post-card">
        <button
          type="button"
          className="post-card-img"
          title="Upload image"
          onClick={upload}
        >
          {image == null ? (
            <FaSquarePlus />
          ) : (
            <div className="post-img-wrapper">
              <img src={previewImageURL} alt="Preview" />
            </div>
          )}
        </button>
        <input
          type="file"
          ref={fileInput}
          onChange={handleImageChange}
          accept="image/*"
        />
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
          <button
            className="submit-post"
            type="submit"
            onClick={handleSubmit}
            disabled={caption.length > 512 || !image}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
