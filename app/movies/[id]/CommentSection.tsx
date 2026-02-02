"use client";

import { useState, useEffect } from "react";
import CommentModal from "./CommentModal";

type Comment = {
  _id: string;
  name: string;
  text: string;
  date: string;
};

type Props = {
  movieId: string;
};

export default function CommentSection({ movieId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/comments?movieId=${movieId}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [movieId]);

  const handleSuccess = () => {
    setSuccess("Comment posted successfully.");
    fetchComments();
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="font-display text-xl font-semibold text-foreground">
          Comments
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-full font-semibold bg-accent text-black hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20"
        >
          Add comment
        </button>
      </div>

      {success && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-accent-muted border border-accent/30 text-accent">
          {success}
        </div>
      )}

      {loading ? (
        <p className="text-muted py-6">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-muted py-6">No comments yet. Be the first.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map(c => (
            <li
              key={c._id}
              className="p-5 rounded-xl bg-card border border-border"
            >
              <p className="font-semibold text-foreground">{c.name || "Anonymous"}</p>
              <p className="text-foreground mt-1 leading-relaxed">{c.text}</p>
              <p className="text-muted text-sm mt-2">
                {new Date(c.date).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}

      {isModalOpen && (
        <CommentModal
          movieId={movieId}
          onSuccess={() => {
            handleSuccess();
            setIsModalOpen(false);
          }}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
