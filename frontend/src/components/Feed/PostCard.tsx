import { forwardRef, useEffect, useState } from "react";
import { selectPostById } from "../../redux/reducers/posts"
import { useAppSelector } from "../../redux/util"
import "./PostCard.css"

const PostCard = forwardRef<HTMLDivElement, { postId: number }>(
  ({ postId }, ref) => {
    const post = useAppSelector(state => selectPostById(state, postId));
    const [loaded, setLoaded] = useState<boolean>(false);

    useEffect(() => {
      if (loaded || !post) return;

      setLoaded(true);
    }, [post])

    return (
      <div ref={ref} className="post-scroll-container">
        <article className="card post-card">
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
