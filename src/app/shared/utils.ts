import { FETCH_DAYS_RANGE_OFFSET } from 'src/app/shared/const';

export function getTodayIsoNoTimeNoTZ(): string {
  return dateToIsoNoTimeNoTZ(new Date().getTime());
}

export function dateToIsoNoTimeNoTZ(milliseconds: number): string {
  // There was a more neat way (date.toISOString().slice(0,10)), but there were problems with TZs
  const date = new Date(milliseconds);
  return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
}

export function generateDatesList(inputDateIso: string): string[] {
  const today = new Date().setHours(0, 0, 0, 0);
  const inputDate = new Date(inputDateIso);
  const resultDatesList: string[] = [];

  for (let i = -FETCH_DAYS_RANGE_OFFSET; i <= FETCH_DAYS_RANGE_OFFSET; i++) {
    const newDate = new Date(inputDate);
    newDate.setDate(inputDate.getDate() + i);
    newDate.setHours(0, 0, 0, 0);
    if (newDate.getTime() > today) {
      break;
    }
    const isoDate = dateToIsoNoTimeNoTZ(newDate.getTime());
    resultDatesList.push(isoDate);
  }

  return resultDatesList;
}

export function splitNumber(numStr: string): [string, string, string] {
  let sign = '';
  if (numStr.startsWith('-')) {
    sign = '-';
    numStr = numStr.substring(1);
  }
  let [integer, fraction] = numStr.split('.');
  return [sign, integer, fraction ? '.' + fraction : ''];
}

export function divideNumberWithWhitespaces(num: string): string {
  let result = [];
  let count = 0;
  for (let i = num.length - 1; i >= 0; i--) {
    if (count > 0 && count % 3 === 0) {
      result.unshift(' ');
    }
    result.unshift(num.charAt(i));
    count++;
  }
  return result.join('');
}
