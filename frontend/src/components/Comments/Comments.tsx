import { useEffect, useState } from "react";
import type React from "react";
import {
  BsDashCircle,
  BsDashCircleFill,
  BsPlusCircle,
  BsPlusCircleFill,
  BsSend,
} from "react-icons/bs";
import { VscCommentDiscussion } from "react-icons/vsc";
import { ASSET_URL, AVATAR_URL } from "../../appConfig";
import type { Comment } from "../../types/Models";
import "./Comments.css";
import { Tree } from "../../types/ReplyTree";

export default function Comments({ postId }: { postId: number }) {
  const [comments, setComments] = useState<Record<number, Comment>>({});
  const [replies, setReplies] = useState<{
    rootCommentId: number | null;
    comments: Tree<Comment> | null;
  }>({ rootCommentId: null });
  const [collapsed, setCollapsed] = useState(true);
  const [comment, setComment] = useState("");

  useEffect(() => {
    // keeping comments in the store offers  benefits at the moment, so we simply don't
    fetch(`/api/post/${postId}/comments`).then((res) =>
      res.json().then((data: { comments: Comment[] }) => {
        const resComments: Record<number, Comment> = {};

        for (const cmt of data.comments) {
          resComments[cmt.id] = cmt;
        }

        setComments(resComments as Record<number, Comment>);
        document.querySelector(".comment-list")?.scrollTo(0, 0);
      }),
    );
  }, [postId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <aside className={`comments${collapsed ? " collapsed" : ""}`}>
      <button
        type="button"
        className="collapse-btn"
        onClick={() => setCollapsed((prev) => !prev)}
      >
        <VscCommentDiscussion />
      </button>
      <div className="comment-list">
        {Object.values(comments).map((cmt) => {
          return (
            <>
              <div key={cmt.id} className="comment">
                <div className="comment-header">
                  <div className="nametag">
                    <div className="comment-pfp pfp">
                      <img alt="" src={`${AVATAR_URL}/${cmt.author!.avatar}`} />
                    </div>
                    <button type="button" className="username">
                      {cmt.author!.username}
                    </button>
                  </div>
                  <div className="comment-reactions">
                    <div className="reaction-like">
                      <BsPlusCircle />
                      {/*<BsPlusCircleFill />*/}
                    </div>
                    <div className="reaction-dislike">
                      <BsDashCircle />
                      {/*<BsDashCircleFill />*/}
                    </div>
                  </div>
                </div>
                <p className="comment-content">{cmt.content}</p>
                {cmt.reply_count ? (
                  <button type="button" className="replies-btn">
                    Show Replies
                  </button>
                ) : null}
                <img alt="" className="hr sm" src={`${ASSET_URL}/hr-sm.svg`} />
              </div>
            </>
          );
        })}
      </div>
      <form className="comment-field" onSubmit={handleSubmit}>
        <div className="input">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.currentTarget.value)}
            placeholder="Leave a comment"
          />
        </div>
        <button type="submit">
          <BsSend />
        </button>
      </form>
    </aside>
  );
}
