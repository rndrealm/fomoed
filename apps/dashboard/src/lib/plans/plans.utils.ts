import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

export const TRIAL_PERIOD_DAYS = 7;

dayjs.extend(relativeTime);

export function unixToRenewsIn(unixTimestamp: number): string {
  const now = dayjs();
  const date = dayjs.unix(unixTimestamp);
  const diffDays = date.diff(now, "day");

  if (diffDays <= 0) {
    return "today";
  } else if (diffDays === 1) {
    return "1 day";
  } else {
    return `${diffDays} days`;
  }
}
