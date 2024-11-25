import React, { ReactElement, useEffect, useRef, useState } from "react";
import { getRecentPosts, selectOrderedPosts } from "../../redux/reducers/posts";
import { useAppDispatch, useAppSelector } from "../../redux/util";
import PostCard from "./PostCard";
import "./Feed.css";
import Comments from "../Comments/Comments";

export default function Feed(
  { subfeed = false, popular = false }:
    { subfeed: boolean, popular: boolean }
) {
  const posts = useAppSelector(state => selectOrderedPosts(state));
  const dispatch = useAppDispatch();
  const [currentPostId, setCurrentPostId] = useState<number | null>(null)
  const cards = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    dispatch(getRecentPosts());

    const handleIntersect = (
      entries: IntersectionObserverEntry[],
      _observer: IntersectionObserver
    ) => {
      console.log('intersection with entries:', entries);

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!entry.target.id.startsWith("post-")) return;
          console.log('entry matched:', entry);

          setCurrentPostId(parseInt(entry.target.id.slice(5)));
        }
      });
    }

    const observer = new IntersectionObserver(handleIntersect, {
      root: document.querySelector("div.feed"),
      threshold: 1.0,
    });

    cards.current.forEach((e) => {
      observer.observe(e);
    });
  }, []);



  return (
    <>
      <div className="feed">
        {posts?.map((post, idx) =>
          <PostCard
            key={post.id}
            ref={(ele) => {
              if (ele) cards.current[idx] = ele;
            }}
            postId={post.id}
          />
        )}
      </div>
      {currentPostId != null
        ? <Comments postId={currentPostId} />
        : <h2>Loading comments...</h2>
      }
    </>
  )
}
