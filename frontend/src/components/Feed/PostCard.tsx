import { forwardRef, useEffect, useState } from "react";
import { selectPostById } from "../../redux/reducers/posts"
import { useAppDispatch, useAppSelector } from "../../redux/util"
import "./PostCard.css"
import { getUserDetails, selectUserById } from "../../redux/reducers/users";
import { AVATAR_URL } from "../../appConfig";

const PostCard = forwardRef<HTMLDivElement, { postId: number }>(
  ({ postId }: { postId: number }, ref) => {
    const post = useAppSelector(state => selectPostById(state, postId));
    const author = useAppSelector(state => selectUserById(state, post.author_id))
    const [loaded, setLoaded] = useState<boolean>(false);
    const dispatch = useAppDispatch();

    useEffect(() => {
      if (loaded || !post) return;

      if (!author) {
        dispatch(getUserDetails(post.author_id)).then(() => setLoaded(true));
      } else {
        setLoaded(true);
      }
    }, [post, author])

    return (
      <div ref={ref} className="post-scroll-container">
        <article className="card post-card">
          <div className="op-credit">
            <div className="op-pfp pfp">
              <img src={`${AVATAR_URL}/${author?.avatar || "nopfp.png"}`} />
            </div>
            <h4>{author?.username}</h4>
          </div>
          <button className="post-card-img">
            {
              post
                ? <img src={`https://static.weavewire.tylerhaag.dev/images/${post.image_file}`} />
                : <h2>Loading...</h2>
            }
          </button>
          <div className="post-details">
            {post && (
              <>
                {post.caption && (
                  <div className="post-caption">
                    {post.caption}
                  </div>
                )}
                {/*<div className="post-tags">
              {post.tags}
            </div>*/}
              </>
            )}
          </div>
        </article>
      </div>
    )
  })

export default PostCard;
