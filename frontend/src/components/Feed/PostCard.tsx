import { forwardRef, useEffect, useState } from "react";
import { selectPostById } from "../../redux/reducers/posts";
import { useAppSelector } from "../../redux/util";
import "./PostCard.css";
import { AVATAR_URL } from "../../appConfig";

const PostCard = forwardRef<HTMLDivElement, { postId: number }>(
  ({ postId }: { postId: number }, ref) => {
    const post = useAppSelector((state) => selectPostById(state, postId));
    const [loaded, setLoaded] = useState<boolean>(false);

    useEffect(() => {
      if (loaded || !post) return;

      setLoaded(true);
    }, [post, loaded]);

    return (
      <div ref={ref} className="post-scroll-container">
        <article className="card post-card">
          <div className="op-credit">
            <div className="op-pfp pfp">
              <img src={`${AVATAR_URL}/${post.author.avatar || "nopfp.png"}`} />
            </div>
            <button className="username">{post.author.username}</button>
          </div>
          <button className="post-card-img">
            {post ? ( // TODO figure out a way to allow users to provide alt text
              <img
                alt=""
                src={`https://static.weavewire.tylerhaag.dev/images/${post.image_file}`}
              />
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
                {/*<div className="post-tags">
              {post.tags}
            </div>*/}
              </>
            )}
          </div>
        </article>
      </div>
    );
  },
);

export default PostCard;
