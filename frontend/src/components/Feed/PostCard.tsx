import { forwardRef, useEffect, useState } from "react";
import { deletePost, selectPostById } from "../../redux/reducers/posts";
import { useAppDispatch, useAppSelector } from "../../redux/util";
import "./PostCard.css";
import { AVATAR_URL } from "../../appConfig";
import { GoTrash } from "react-icons/go";
import { FiEdit3 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const PostCard = forwardRef<HTMLDivElement, { postId: number }>(
  ({ postId }: { postId: number }, ref) => {
    const user = useAppSelector((state) => state.session.user);
    const post = useAppSelector((state) => selectPostById(state, postId));
    const [loaded, setLoaded] = useState(false);
    const [tryingDelete, setTryingDelete] = useState(false);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
      if (loaded || !post) return;

      setLoaded(true);
    }, [post, loaded]);

    const handleEditClicked = () => {
      navigate(`/edit/${postId}`);
    };

    const handleDeleteClicked = () => {
      if (!tryingDelete) {
        setTryingDelete(true);
        return;
      }

      dispatch(deletePost(postId));
    };

    return post ? (
      <div id={`post-${postId}`} ref={ref} className="post-scroll-container">
        <article className="card post-card">
          <div className="post-card-header">
            <div className="op-info">
              <div className="pfp">
                <img
                  alt=""
                  src={`${AVATAR_URL}/${post.author!.avatar || "nopfp.png"}`}
                />
              </div>
              <button
                type="button"
                className="username"
                onClick={() => alert("Profile page not yet implemented")}
              >
                {post.author!.username}
              </button>
            </div>
            <div className="post-actions">
              {post.author_id === user?.id ? (
                <>
                  <div className="edit-btn" onClick={handleEditClicked}>
                    <FiEdit3 />
                  </div>
                  <div className="delete-btn" onClick={handleDeleteClicked}>
                    <GoTrash />
                  </div>
                </>
              ) : null}
            </div>
          </div>
          <button type="button" className="post-card-img">
            {post ? ( // TODO figure out a way to allow users to provide alt text
              <div className="post-img-wrapper">
                <img
                  alt=""
                  src={`https://static.weavewire.tylerhaag.dev/images/${post.image_file}`}
                />
              </div>
            ) : (
              <h2>Loading...</h2>
            )}
          </button>
          <div className="post-details">
            {post && (
              <>
                {post.caption && (
                  <div className="post-caption">{post.caption}</div>
                )}
                {/*
								 <div className="post-tags">
								   {post.tags}
								 </div>
								 */}
              </>
            )}
          </div>
        </article>
      </div>
    ) : null;
  },
);

export default PostCard;
