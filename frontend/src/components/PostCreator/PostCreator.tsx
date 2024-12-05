import { FaSquarePlus } from "react-icons/fa6";
import "./PostCreator.css";
import "../Feed/PostCard.css";
import { type ReactElement, useEffect, useRef, useState } from "react";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import {
  createPost,
  getPost,
  selectPostById,
  updatePost,
} from "../../redux/reducers/posts";
import { useAppDispatch, useAppSelector } from "../../redux/util";
import { useNavigate, useParams } from "react-router-dom";
import { POST_IMG_URL } from "../../appConfig";

export default function PostCreator() {
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<ReactElement | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [previewImageURL, setPreviewURL] = useState("");
  const fileInput = useRef<HTMLInputElement | null>(null);
  const { postId } = useParams();
  const post = useAppSelector((state) =>
    postId ? selectPostById(state, Number.parseInt(postId)) : undefined,
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (postId && !post) {
      dispatch(getPost(Number.parseInt(postId)));
    } else if (post) {
      setCaption(post.caption);
    }
  }, [post, postId, dispatch]);

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

    // this is so cursed but it's literally always the best option
    const thunk = !postId // @ts-ignore stop complaining about image being null (it's not)
      ? createPost({ image, caption })
      : updatePost({ postId: Number.parseInt(postId), caption });

    // @ts-ignore once again, the image is not and cannot be null
    const data = await dispatch(thunk);

    // TODO properly type API responses and implement toasts so this isn't necessary
    // @ts-ignore
    if (data.payload.message) {
      // @ts-ignore
      setError(<ErrorMessage msg={data.payload.message} />);
    } else {
      navigate("/feed");
    }
  };

  return (
    <div className="post-creator">
      <div className="card post-card new-post-card">
        {!postId ? (
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
        ) : (
          <div className="post-img-wrapper">
            <img src={`${POST_IMG_URL}/${post?.image_file}`} alt="Preview" />
          </div>
        )}
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
            disabled={caption.length > 512 || !(image || postId)}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
