export function dateToIsoNoTimeNoTZ(date: Date): string {
  let newDate =
    date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
  return newDate;
}
