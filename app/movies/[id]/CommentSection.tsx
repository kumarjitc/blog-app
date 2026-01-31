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
    setSuccess("Comment posted successfully!");
    fetchComments();
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-3">Comments</h2>

      <button
        onClick={() => setIsModalOpen(true)}
        className="mb-4 px-4 py-2 rounded bg-green-600 hover:bg-green-500 text-white"
      >
        Add Comment
      </button>

      {success && (
        <div className="bg-green-600/20 border border-green-500 text-green-300 px-3 py-2 rounded mb-2">
          {success}
        </div>
      )}

      {loading ? (
        <p>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map(c => (
            <li key={c._id} className="border border-gray-700 p-3 rounded bg-gray-800">
              <p className="font-semibold">{c.name}</p>
              <p className="text-gray-300">{c.text}</p>
              <p className="text-gray-500 text-sm">{new Date(c.date).toLocaleString()}</p>
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
