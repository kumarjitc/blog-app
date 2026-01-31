export type ModerationResponse = {
  [key: string]: number | boolean | string;
  is_flagged: boolean;
  is_safer_flagged: boolean;
  max_key: string;
  max_value: number;
  safer_value: number;
  message: string;
};

export type ModerationResult = {
  isSafe: boolean;
  reason: string | null;
  message: string;
};

/**
 * Determines if a message is safe based on moderation response
 */
export function moderateText(
  response: ModerationResponse
): ModerationResult {
  if (!response || typeof response !== "object") {
    return {
      isSafe: false,
      reason: "invalid_response",
      message: "Invalid moderation response",
    };
  }

  const {
    is_flagged,
    is_safer_flagged,
    max_key,
    max_value,
    safer_value,
    message,
  } = response;

  if (is_flagged || is_safer_flagged) {
    return {
      isSafe: false,
      reason: max_key || "policy_violation",
      message: "Comment flagged by moderation system",
    };
  }

  if (typeof max_value === "number" && max_value >= safer_value) {
    return {
      isSafe: false,
      reason: max_key,
      message: `Content exceeds safety threshold (${safer_value})`,
    };
  }

  return {
    isSafe: true,
    reason: null,
    message: message || "Content is safe",
  };
}
