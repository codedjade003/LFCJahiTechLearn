// utils/streakUtils.js
import User from "../models/User.js";

/**
 * Updates a user's streak in a timezone-robust way (UTC-based date-only comparison).
 * Returns the updated streak object.
 */
export const updateUserStreakForUser = async (userId) => {
  const user = await User.findById(userId).select("streak");
  const now = new Date();

  const toUTCDateNumber = (d) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const todayUTC = toUTCDateNumber(now);

  const lastLoginRaw = user.streak?.lastLogin ? new Date(user.streak.lastLogin) : null;
  const lastLoginUTC = lastLoginRaw ? toUTCDateNumber(lastLoginRaw) : null;

  const oneDay = 24 * 60 * 60 * 1000;
  const daysSinceLastLogin = lastLoginUTC !== null
    ? Math.floor((todayUTC - lastLoginUTC) / oneDay)
    : Infinity;

  let currentStreak = user.streak?.current || 0;
  let longestStreak = user.streak?.longest || 0;

  // already logged in today
  if (daysSinceLastLogin === 0) {
    return user.streak;
  }

  if (daysSinceLastLogin === 1) {
    currentStreak += 1;
  } else {
    // gap or first time
    currentStreak = 1;
  }

  if (currentStreak > longestStreak) longestStreak = currentStreak;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        "streak.current": currentStreak,
        "streak.longest": longestStreak,
        "streak.lastLogin": new Date() // store actual timestamp (UTC stored by Mongo)
      }
    },
    { new: true }
  ).select("streak");

  return updatedUser.streak;
};
