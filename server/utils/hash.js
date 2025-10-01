// utils/hash.js
import crypto from "crypto";

export const hashCode = (code) => {
  return crypto.createHash("sha256").update(code).digest("hex");
};
