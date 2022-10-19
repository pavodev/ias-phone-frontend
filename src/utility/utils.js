export function getMinuteDifference(date1, date2) {
  let diffMs = Math.abs(date2 - date1);
  return Math.floor(diffMs / 1000 / 60);
}
