export const daysLeft = (deadline) => {
  if (!deadline) return 0;

  let deadlineTime = Number(deadline);

  // If the timestamp is in seconds, convert it to milliseconds.
  // Unix timestamps in milliseconds are always 13 digits.
  if (deadlineTime < 1000000000000) {
    deadlineTime *= 1000;
  }

  const difference = deadlineTime - Date.now();

  // Campaign has ended
  if (difference <= 0) {
    return 0;
  }

  // Calculate remaining days (rounds up so part of a day counts as 1 day)
  return Math.ceil(difference / (1000 * 60 * 60 * 24));
};

export const calculateBarPercentage = (goal, raisedAmount) => {
  const percentage = Math.round((raisedAmount * 100) / goal);

  return percentage;
};

export const checkIfImage = (url, callback) => {
  const img = new Image();
  img.src = url;

  if (img.complete) callback(true);

  img.onload = () => callback(true);
  img.onerror = () => callback(false);
};