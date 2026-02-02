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

      type ApiResponse = { success?: boolean; error?: string };
      let data: ApiResponse;
      try {
        data = (await res.json()) as ApiResponse;
      } catch {
        setError("Server returned invalid response");
        return;
      }

      if (!res.ok || !data.success) {
        setError(data.error ?? "Comment blocked by moderation");
        return;
      }

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">
          Add comment
        </h2>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Your name (optional)"
          className="w-full mb-3 px-4 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <textarea
          placeholder="Write your comment…"
          className="w-full h-28 px-4 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition resize-none"
          value={text}
          onChange={e => setText(e.target.value)}
        />

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl font-medium text-muted hover:text-foreground border border-border hover:bg-surface-hover transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl font-semibold bg-accent text-black hover:bg-accent-hover disabled:opacity-50 transition"
          >
            {loading ? "Checking…" : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
