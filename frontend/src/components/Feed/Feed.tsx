import { useEffect, useRef, useState } from "react";
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
  const [page, setPage] = useState(0);
  const [fetchDebounce, setFetchDebounce] = useState(false);
  const cards = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    let observer: IntersectionObserver;

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

    return () => observer?.disconnect();
  }, [cards]);

  useEffect(() => {
    //console.log(
    //  `EFFECT INFO:\nfetchDebounce is ${fetchDebounce}\nposts.length is ${posts.length}\ncurrentPostId is ${currentPostId}\ncurrent index is ${posts.findIndex((p) => p.id === currentPostId)}\npage is ${page}`,
    //);

    if (!currentPostId) {
      dispatch(getRecentPosts(0));
      return;
    }

    if (
      fetchDebounce ||
      posts.findIndex((p) => p.id === currentPostId) < posts.length - 5
    ) {
      return;
    }

    setFetchDebounce(true);
    dispatch(getRecentPosts(page + 1)).then(() => {
      //console.log("fetch complete");
      setFetchDebounce(false);
    });
    setPage((prev) => prev + 1);

    // i'm aware these deps are wrong, but i don't think doing it correctly is possible here
    // without murdering the server with an infinite fetch loop
  }, [currentPostId]);

  return (
    <>
      <div className="feed">
        {posts?.map((post, idx) =>
          post ? (
            <PostCard
              key={post.id}
              ref={(ele) => {
                if (ele) cards.current[idx] = ele;
              }}
              postId={post.id}
            />
          ) : null,
        )}
      </div>
      {currentPostId ? <Comments postId={currentPostId} /> : null}
    </>
  );
}
