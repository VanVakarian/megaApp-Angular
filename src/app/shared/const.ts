import { Settings } from './interfaces';

export const FETCH_DAYS_RANGE_OFFSET: number = 10; // TODO: create settings item out of this constant

// export const CHART_COLORS_OLD = {
//   primary: 'red',
//   primaryAlpha: '#ff00004f',
//   average: 'blue',
//   averageAlpha: '#adadff'
// };

export const CHART_COLORS = {
  main: '#578f92',
  mainAlpha: '#578f9250',
  secondary: '#345b5b',
  secondaryAlpha: '#345b5b50',
};

export const WEIGHT_CHART_SETTINGS: any = {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Вес',
        data: [],
        order: 2,
        fill: true,
        borderColor: CHART_COLORS.main,
        backgroundColor: CHART_COLORS.mainAlpha,
        pointBorderColor: CHART_COLORS.main,
        pointBackgroundColor: CHART_COLORS.main,
        pointRadius: 2,
        pointHitRadius: 20,
      },
      {
        label: 'Средний вес за 7 дней',
        data: [],
        order: 1,
        borderColor: CHART_COLORS.secondary,
        backgroundColor: CHART_COLORS.secondaryAlpha,
        pointBorderColor: CHART_COLORS.secondary,
        pointBackgroundColor: CHART_COLORS.secondary,
        pointRadius: 2,
        pointHitRadius: 20,
      },
    ],
  },
  options: {
    animation: false,
    elements: { line: { tension: 0.5 } },
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {},
      },
      y: {
        ticks: { stepSize: 1 },
      },
    },
  },
};

export const KCALS_CHART_SETTINGS: any = {
  type: 'bar',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Ккал за день',
        data: [],
        order: 2,
        borderColor: CHART_COLORS.main,
        backgroundColor: CHART_COLORS.main,
        borderWidth: 1,
        barThickness: 'flex',
        maxBarThickness: 30,
      },
      {
        label: 'Целевое значение',
        data: [],
        order: 1,
        type: 'line',
        borderColor: CHART_COLORS.secondary,
        backgroundColor: CHART_COLORS.secondaryAlpha,
        pointBorderColor: CHART_COLORS.secondary,
        pointBackgroundColor: CHART_COLORS.secondary,
        pointRadius: 2,
        pointHitRadius: 20,
      },
    ],
  },
  options: {
    animation: false,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {},
      },
      y: {
        ticks: { stepSize: 500 },
      },
    },
  },
};

interface Declentions {
  [key: number]: string;
}

export const daysRuDeclentions: Declentions = {
  1: 'день',
  2: 'дня',
  3: 'дня',
  4: 'дня',
  5: 'дней',
  6: 'дней',
  7: 'дней',
  8: 'дней',
  9: 'дней',
  10: 'дней',
  11: 'дней',
  12: 'дней',
  13: 'дней',
  14: 'дней',
  15: 'дней',
  16: 'дней',
  17: 'дней',
  18: 'дней',
  19: 'дней',
  20: 'дней',
  21: 'день',
  22: 'дня',
  23: 'дня',
  24: 'дня',
  25: 'дней',
  26: 'дней',
  27: 'дней',
  28: 'дней',
  29: 'дней',
  30: 'дней',
  31: 'день',
};

export const monthsRuDeclentions: Declentions = {
  1: 'месяц',
  2: 'месяца',
  3: 'месяца',
  4: 'месяца',
  5: 'месяцев',
  6: 'месяцев',
  7: 'месяцев',
  8: 'месяцев',
  9: 'месяцев',
  10: 'месяцев',
  11: 'месяцев',
  12: 'месяцев',
};

export const yearsRuDeclentions: Declentions = {
  1: 'год',
  2: 'года',
  3: 'года',
  4: 'года',
  5: 'лет',
  6: 'лет',
  7: 'лет',
  8: 'лет',
  9: 'лет',
  10: 'лет',
};

export const enRuTranslation: { [key: string]: string } = {
  '`': 'ё',
  q: 'й',
  w: 'ц',
  e: 'у',
  r: 'к',
  t: 'е',
  y: 'н',
  u: 'г',
  i: 'ш',
  o: 'щ',
  p: 'з',
  '[': 'х',
  ']': 'ъ',
  a: 'ф',
  s: 'ы',
  d: 'в',
  f: 'а',
  g: 'п',
  h: 'р',
  j: 'о',
  k: 'л',
  l: 'д',
  ';': 'ж',
  "'": 'э',
  z: 'я',
  x: 'ч',
  c: 'с',
  v: 'м',
  b: 'и',
  n: 'т',
  m: 'ь',
  ',': 'б',
  '.': 'ю',
};

export const USER_PREFERRED_MIDNIGHT_OFFSET_HOURS = 5;

export const DEFAULT_INPUT_FIELD_PROGRESS_TIMER = 2000;
export const DEFAULT_REQUEST_STATUS_FADE_OUT_TIMER = 3000;

export const DEFAULT_SETTINGS: Settings = {
  selectedChapterFood: false,
  selectedChapterMoney: false,
  darkTheme: false,
  height: null,
  userName: '',
};

export const DEFAULT_CACHED_REQUEST_VALIDITY_MS = 1000;
