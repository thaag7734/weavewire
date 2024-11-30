import React, { ReactElement, useEffect, useRef, useState } from "react";
import { getRecentPosts, selectOrderedPosts } from "../../redux/reducers/posts";
import { useAppDispatch, useAppSelector } from "../../redux/util";
import PostCard from "./PostCard";
import "./Feed.css";
import Comments from "../Comments/Comments";

export default function Feed({
  subfeed = false,
  popular = false,
}: { subfeed: boolean; popular: boolean }) {
  const posts = useAppSelector((state) => selectOrderedPosts(state));
  const dispatch = useAppDispatch();
  const [currentPostId, setCurrentPostId] = useState<number | null>(null);
  const cards = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    let observer: IntersectionObserver;

    dispatch(getRecentPosts()).then(() => {
      const handleIntersect = (
        entries: IntersectionObserverEntry[],
        _observer: IntersectionObserver,
      ) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!entry.target.id.startsWith("post-")) return;

            setCurrentPostId(Number.parseInt(entry.target.id.slice(5)));
          }
        }
      };

      observer = new IntersectionObserver(handleIntersect, {
        root: document.querySelector("div.feed"),
        threshold: 1.0,
      });

      for (const card of cards.current) {
        observer.observe(card);
      }
    });

    return () => observer?.disconnect();
  }, [dispatch]);

  return (
    <>
      <div className="feed">
        {posts?.map((post, idx) => (
          <PostCard
            key={post.id}
            ref={(ele) => {
              if (ele) cards.current[idx] = ele;
            }}
            postId={post.id}
          />
        ))}
      </div>
      {currentPostId ? <Comments postId={currentPostId} /> : null}
    </>
  );
}
