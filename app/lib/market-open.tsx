export function isMarketOpenNow() {
  const now = new Date();

  // IST conversion
  const ist = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  );

  const day = ist.getDay(); // 0 Sun, 6 Sat
  if (day === 0 || day === 6) return false;

  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const time = hours * 60 + minutes;

  const open = 9 * 60 + 15;
  const close = 15 * 60 + 30;

  return time >= open && time <= close;
}
