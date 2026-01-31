"use client";

import { useState } from "react";

type Props = {
  movieId: string;
  onSuccess: () => void;
  onClose: () => void;
};

export default function CommentModal({ movieId, onSuccess, onClose }: Props) {
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);

    try {

      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId,
          name,
          text,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        setError("Server returned invalid response");
        return;
      }

      if (!res.ok || !data.success) {
        setError(data.error || "Comment blocked by moderation");
        return; // keep modal open
      }

      // ✅ Success
      setText("");
      setName("");
      onSuccess();
      onClose();
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Add Comment</h2>

        {error && (
          <div className="bg-red-600/20 border border-red-500 text-red-300 px-3 py-2 rounded mb-3">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Your name (optional)"
          className="w-full mb-3 px-3 py-2 rounded bg-gray-800 border border-gray-700"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <textarea
          placeholder="Write your comment..."
          className="w-full h-28 px-3 py-2 rounded bg-gray-800 border border-gray-700 resize-none"
          value={text}
          onChange={e => setText(e.target.value)}
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 disabled:opacity-50"
          >
            {loading ? "Checking..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
