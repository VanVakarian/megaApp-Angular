export const FETCH_DAYS_RANGE_OFFSET: number = 10; // TODO: create settings item out of this constant

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
        borderColor: 'red',
        backgroundColor: '#ff00004f',
        pointBorderColor: 'red',
        pointBackgroundColor: 'red',
        pointRadius: 2,
        pointHitRadius: 20,
      },
      {
        label: 'Средний вес за 7 дней',
        data: [],
        order: 1,
        borderColor: 'blue',
        backgroundColor: '#adadff',
        pointBorderColor: 'blue',
        pointBackgroundColor: 'blue',
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
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Ккал за день',
        data: [],
        order: 2,
        fill: true,
        borderColor: 'red',
        backgroundColor: '#ff00004f',
        pointBorderColor: 'red',
        pointBackgroundColor: 'red',
        pointRadius: 2,
        pointHitRadius: 20,
      },
      {
        label: 'Целевое значение',
        data: [],
        order: 1,
        borderColor: 'blue',
        backgroundColor: '#adadff',
        pointBorderColor: 'blue',
        pointBackgroundColor: 'blue',
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

export const monthsDeclentions: Declentions = {
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

export const yearsDeclentions: Declentions = {
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
