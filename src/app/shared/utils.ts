export function dateToIsoNoTimeNoTZ(date: Date): string {
  return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
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
