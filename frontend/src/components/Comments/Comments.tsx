import { useEffect, useState } from "react";
import type React from "react";
import { BsReply, BsSend } from "react-icons/bs";
import { VscCommentDiscussion } from "react-icons/vsc";
import { ASSET_URL, AVATAR_URL } from "../../appConfig";
import type { Comment } from "../../types/Models";
import "./Comments.css";
import { csrfFetch } from "../../util/csrfFetch";
import { RxCross1 } from "react-icons/rx";
import { FiEdit3 } from "react-icons/fi";
import { useAppSelector } from "../../redux/util";
import { GoTrash } from "react-icons/go";

export default function Comments({ postId }: { postId: number }) {
	const user = useAppSelector((state) => state.session.user);
	const [comments, setComments] = useState<Record<number, Comment>>({});
	const [replies, setReplies] = useState<{
		rootCommentId: number | null;
		comments: (Comment & { depth: number })[];
	}>({ rootCommentId: null, comments: [] });
	const [repliesVisible, setRepliesVisible] = useState(false);
	const [collapsed, setCollapsed] = useState(true);
	const [comment, setComment] = useState("");
	const [replyingTo, setReplyingTo] = useState<number | null>(null);
	const [editingId, setEditingId] = useState<number | null>(null);

	useEffect(() => {
		// keeping comments in the store offers no benefits at the moment, so we simply don't
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

	const showReplies = (id: number, noToggle = false) => {
		if (repliesVisible && !noToggle) {
			setRepliesVisible(false);
			setReplies({ rootCommentId: null, comments: [] });

			if (replies.rootCommentId === id) return;
		}

		fetch(`/api/comment/${id}/replies`).then((res) => {
			setReplies({ rootCommentId: id, comments: [] });

			res.json().then((data: { replies: Comment[] }) => {
				const visited: Set<Comment> = new Set();
				const stack: (Comment & { depth: number })[] = data.replies.map(
					(reply) => {
						return { ...reply, depth: 0 };
					},
				);

				function traverse(): void {
					if (stack.length === 0) {
						return;
					}

					const current = stack.pop()!;
					setReplies((prev) => ({
						...prev,
						comments: [...prev.comments, current],
					}));

					for (const child of current.children!) {
						if (visited.has(child)) continue;

						stack.push({ ...child, depth: current.depth + 1 });
					}

					traverse();
				}

				traverse();
				setReplies((prev) => ({ ...prev, rootCommentId: id }));
				setRepliesVisible(true);
			});
		});
	};

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();

		if (!comment.length || comment.length > 255) {
			const element = document.querySelector("form.comment-field>div.input");

			if (!element) return;

			element.classList.add("error");
		}

		const fetchUrl = replyingTo
			? `/api/comment/${replyingTo}/replies`
			: editingId
				? `/api/comment/${editingId}`
				: `/api/post/${postId}/comments`;
		const res = await csrfFetch(fetchUrl, {
			method: editingId ? "PUT" : "POST",
			body: JSON.stringify({ content: comment }),
			headers: { "Content-Type": "application/json" },
		});

		const data = await res.json();

		if (res.ok) {
			if (editingId) {
				if (comments[editingId]) {
					setComments((prev) => ({ ...prev, [editingId]: data }));
				} else {
					showReplies(
						Number.parseInt(
							replies.comments
								.find((c) => c.id === editingId)!
								.reply_path.split(":")[0],
						),
						true,
					);
				}

				setComment("");
				return;
			}

			if (!replyingTo) {
				setComments((prev) => ({ ...prev, [data.id]: data }));
			} else {
				// TODO this is a temporary cop-out that WILL cause issues and should be fixed later
				// me when my temporary cop-out that WILL cause issues does,
				// indeed, cause issues: D:
				showReplies(
					comments[replyingTo]
						? replyingTo
						: Number.parseInt(
								replies.comments
									.find((c) => c.id === replyingTo)!
									.reply_path.split(":")[0],
							),
					true,
				);
			}

			setComment("");
		}
	};

	const handleChange = async (
		e: React.ChangeEvent<HTMLTextAreaElement>,
	): Promise<void> => {
		setComment(e.currentTarget.value);

		if (comment.length > 0 && comment.length <= 255) {
			e.currentTarget.parentElement!.classList.remove("error");
		}
	};

	const handleReplyClicked = async (
		e: React.MouseEvent<HTMLDivElement>,
	): Promise<void> => {
		e.stopPropagation();

		const target = e.currentTarget;

		// i hate this more than any other line of code in this entire project,
		// possibly more than every line of code i've ever written in my life
		const commentId = Number.parseInt(
			target.parentElement!.parentElement!.parentElement!.dataset.id!,
		);

		setEditingId(null);
		setReplyingTo(commentId);
		(
			document.querySelector(
				"form.comment-field>div.input>textarea",
			) as HTMLTextAreaElement
		).focus();
	};

	const handleEditClicked = async (
		e: React.MouseEvent<HTMLDivElement>,
	): Promise<void> => {
		e.stopPropagation();

		const target = e.currentTarget;

		// oh look im doing it again (crying)
		const commentId = Number.parseInt(
			target.parentElement!.parentElement!.parentElement!.dataset.id!,
		);

		setReplyingTo(null);
		setEditingId(commentId);
		setComment(
			comments[commentId]?.content ??
				replies.comments.find((c) => c.id === replyingTo)!.content,
		);
		(
			document.querySelector(
				"form.comment-field>div.input>textarea",
			) as HTMLTextAreaElement
		).focus();
	};

	const handleDeleteClicked = async (
		e: React.MouseEvent<HTMLDivElement>,
	): Promise<void> => {
		e.stopPropagation();

		const target = e.currentTarget;

		// AAAAAAAAAAAAAAAAAAAA
		const commentId = Number.parseInt(
			target.parentElement!.parentElement!.parentElement!.dataset.id!,
		);

		if ([replyingTo, editingId].includes(commentId)) setComment("");
		if (replyingTo === commentId) setReplyingTo(null);
		if (editingId === commentId) setEditingId(null);

		const res = await csrfFetch(`/api/comment/${commentId}`, {
			method: "DELETE",
		});

		if (res.ok) {
			if (comments[commentId]) {
				setComments((prev) =>
					Object.fromEntries(
						Object.entries(prev).filter(([_, c]) => c.id !== commentId),
					),
				);
			} else {
				setReplies((prev) => ({
					...prev,
					comments: prev.comments.map((c) =>
						c.id === commentId
							? {
									...c,
									content: "Comment was deleted",
									deleted_at: new Date().toISOString(),
								}
							: c,
					),
				}));
			}
		}
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
			{Object.values(comments).length ? (
				<div className="comment-list">
					{Object.values(comments)
						.sort(
							(a, b) =>
								new Date(b.created_at).getTime() -
								new Date(a.created_at).getTime(),
						)
						.map((cmt) => {
							return (
								<>
									<div
										key={cmt.id}
										data-id={cmt.id}
										className={`comment${
											repliesVisible && replies.rootCommentId === cmt.id
												? " has-replies"
												: ""
										}${editingId === cmt.id ? " editing" : ""}`}
									>
										<div className="comment-header">
											<div className="nametag">
												<div className="comment-pfp pfp">
													<img
														alt=""
														src={`${AVATAR_URL}/${cmt.author!.avatar}`}
													/>
												</div>
												<button
													type="button"
													className="username"
													onClick={() =>
														alert("Profile page not yet implemented")
													}
												>
													{cmt.author!.username}
												</button>
											</div>
											<div className="comment-reactions">
												{cmt.author_id === user?.id ? (
													<>
														<div
															className="trash-btn"
															onClick={handleDeleteClicked}
														>
															<GoTrash />
														</div>
														<div
															className="edit-btn"
															onClick={handleEditClicked}
														>
															<FiEdit3 />
														</div>
													</>
												) : null}
												<div className="reply-btn" onClick={handleReplyClicked}>
													<BsReply />
												</div>
												{/*<div className="reaction-like">
													<BsPlusCircle />
													{/*<BsPlusCircleFill />*/
												/*}
												</div>
												<div className="reaction-dislike">
													<BsDashCircle />
													{/*<BsDashCircleFill />*/
												/*}
												</div>*/}
											</div>
										</div>
										<p className="comment-content">{cmt.content}</p>
										{cmt.reply_count! > 0 ? (
											<button
												type="button"
												className="replies-btn"
												onClick={() => showReplies(cmt.id)}
											>
												{repliesVisible && replies.rootCommentId === cmt.id
													? "Hide Replies"
													: `${cmt.reply_count!} ${cmt.reply_count! > 1 ? "Replies" : "Reply"}`}
											</button>
										) : null}
										<img
											alt=""
											className="hr sm"
											src={`${ASSET_URL}/hr-sm.svg`}
										/>
									</div>
									{repliesVisible && replies.rootCommentId === cmt.id ? (
										<div key={`replies-${cmt.id}`} className="replies-view">
											{replies.comments.map((reply) => (
												<div
													key={reply.id}
													data-id={reply.id}
													className="comment"
													style={{ paddingLeft: `${(reply.depth + 1) * 15}px` }}
												>
													{reply.deleted_at === null ? (
														<div className="comment-header">
															<div className="nametag">
																<div className="comment-pfp pfp">
																	<img
																		alt=""
																		src={`${AVATAR_URL}/${reply.author!.avatar}`}
																	/>
																</div>
																<button
																	type="button"
																	className="username"
																	onClick={() =>
																		alert("Profile page not yet implemented")
																	}
																>
																	{reply.author!.username}
																</button>
															</div>
															<div className="comment-reactions">
																{reply.author_id === user?.id ? (
																	<>
																		<div
																			className="trash-btn"
																			onClick={handleDeleteClicked}
																		>
																			<GoTrash />
																		</div>
																		<div
																			className="edit-btn"
																			onClick={handleEditClicked}
																		>
																			<FiEdit3 />
																		</div>
																	</>
																) : null}
																<div
																	className="reply-btn"
																	onClick={handleReplyClicked}
																>
																	<BsReply />
																</div>
																{/*<div className="reaction-like">
																	<BsPlusCircle />
																	{/*<BsPlusCircleFill />*/
																/*}
																</div>
																<div className="reaction-dislike">
																	<BsDashCircle />
																	{/*<BsDashCircleFill />*/
																/*}
																</div>*/}
															</div>
														</div>
													) : null}
													<p className="comment-content">{reply.content}</p>
												</div>
											))}
										</div>
									) : null}
								</>
							);
						})}
				</div>
			) : (
				<h2>No Comments</h2>
			)}
			<form className="comment-field" onSubmit={handleSubmit}>
				<div
					className={`action-line${!(replyingTo || editingId) ? " hidden" : ""}`}
				>
					<span>
						{replyingTo ? (
							<>
								Replying to{" "}
								<span className="username">
									{
										(
											comments[replyingTo] ??
											replies.comments.find((c) => c.id === replyingTo)
										)?.author!.username
									}
								</span>
							</>
						) : editingId ? (
							<>Editing</>
						) : null}
					</span>
					<div
						className="cancel-action-btn"
						onClick={() => {
							setReplyingTo(null);
							setEditingId(null);
						}}
					>
						<RxCross1 />
					</div>
				</div>
				<div className="input">
					<textarea
						value={comment}
						onChange={handleChange}
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
