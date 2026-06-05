export type GroupFilterValue = "today" | "week" | "month" | "year";

type PeriodRange = {
  dateFrom: Date | null;
  dateTo: Date | null;
};

export function getPeriodRange(periodType: GroupFilterValue): PeriodRange {
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  if (periodType === "today") {
    return {
      dateFrom: startOfToday,
      dateTo: startOfTomorrow,
    };
  }

  if (periodType === "week") {
    const dateFrom = new Date(startOfToday);
    dateFrom.setDate(dateFrom.getDate() - 6);

    return {
      dateFrom,
      dateTo: startOfTomorrow,
    };
  }

  if (periodType === "month") {
    const dateFrom = new Date(startOfToday);
    dateFrom.setMonth(dateFrom.getMonth() - 1);

    return {
      dateFrom,
      dateTo: startOfTomorrow,
    };
  }

  if (periodType === "year") {
    const dateFrom = new Date(startOfToday);
    dateFrom.setFullYear(dateFrom.getFullYear() - 1);

    return {
      dateFrom,
      dateTo: startOfTomorrow,
    };
  }

  return {
    dateFrom: null,
    dateTo: null,
  };
}
