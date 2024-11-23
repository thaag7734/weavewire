import React, { ReactElement, useEffect, useRef, useState } from "react";
import { getRecentPosts, selectOrderedPosts } from "../../redux/reducers/posts";
import { useAppDispatch, useAppSelector } from "../../redux/util";
import PostCard from "./PostCard";
import "./Feed.css";

export default function Feed(
  { subfeed = false, popular = false }:
    { subfeed: boolean, popular: boolean }
) {
  const posts = useAppSelector(state => selectOrderedPosts(state));
  const dispatch = useAppDispatch();
  const cards = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    dispatch(getRecentPosts());
  }, [])

  return (
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
  )
}
