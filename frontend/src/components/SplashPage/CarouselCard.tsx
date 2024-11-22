import { useEffect, useRef, useState } from "react";
import { selectPostById } from "../../redux/reducers/posts";
import { useAppSelector } from "../../redux/util";
import "./CarouselCard.css"

export default function CarouselCard({ postId }: { postId: number }) {
  const post = useAppSelector((state) => selectPostById(state, postId));
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div className="carousel-card card" ref={cardRef}>
      <div className="carousel-card-img">
        {post
          ? <img src={`https://static.weavewire.tylerhaag.dev/images/${post.image_file}`} />
          : null}
      </div>
      <p className="carousel-card-caption">{post?.caption}</p>
    </div>
  );
}
