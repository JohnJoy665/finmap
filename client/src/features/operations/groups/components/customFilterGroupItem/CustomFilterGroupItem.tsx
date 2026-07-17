import { useState } from "react";
import { Button, DatePicker, Flex, Popover, Typography } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

import useIsMobile from "../../../../../hooks/useIsMobile";
import styles from "./CustomFilterGroupItem.module.css";

const { Text } = Typography;
const { RangePicker } = DatePicker;

type CustomPeriod = {
  dateFromUTC: string;
  dateToUTC: string;
};

type SelectedRange = [Dayjs, Dayjs] | null;

type CustomFilterGroupItemProps = {
  active?: boolean;
  initialPeriod: CustomPeriod | null;

  minDateLocal: string | null;
  maxDateLocal: string | null;

  dateFromLocal: string | null;
  dateToLocal: string | null;
  amount: string | null;

  onApply: (period: CustomPeriod) => void;
};

function getInitialRange(initialPeriod: CustomPeriod | null): SelectedRange {
  if (!initialPeriod) {
    return null;
  }

  return [
    dayjs(initialPeriod.dateFromUTC),
    dayjs(initialPeriod.dateToUTC).subtract(1, "millisecond"),
  ];
}

function CustomFilterGroupItem({
  active = false,
  initialPeriod,
  minDateLocal,
  maxDateLocal,
  dateFromLocal,
  dateToLocal,
  amount,
  onApply,
}: CustomFilterGroupItemProps) {
  const { isMobile } = useIsMobile();

  const [isOpen, setIsOpen] = useState(false);

  const [selectedRange, setSelectedRange] = useState<SelectedRange>(() =>
    getInitialRange(initialPeriod)
  );

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setSelectedRange(getInitialRange(initialPeriod));
    }

    setIsOpen(nextOpen);
  }

  function handleRangeChange(dates: [Dayjs | null, Dayjs | null] | null) {
    if (!dates?.[0] || !dates[1]) {
      setSelectedRange(null);
      return;
    }

    setSelectedRange([dates[0], dates[1]]);
  }

  function handleApply() {
    if (!selectedRange) return;

    const [dateFrom, dateTo] = selectedRange;

    const period: CustomPeriod = {
      dateFromUTC: dateFrom.startOf("day").toISOString(),
      dateToUTC: dateTo.startOf("day").add(1, "day").toISOString(),
    };

    onApply(period);
    setIsOpen(false);
  }

  function disabledDate(currentDate: Dayjs) {
    const minDate = minDateLocal ? dayjs(minDateLocal).startOf("day") : null;

    const maxDate = maxDateLocal
      ? dayjs(maxDateLocal).endOf("day")
      : dayjs().endOf("day");

    if (minDate && currentDate.isBefore(minDate, "day")) {
      return true;
    }

    if (maxDate && currentDate.isAfter(maxDate, "day")) {
      return true;
    }

    return false;
  }

  function getPeriodLabel() {
    if (!active || !dateFromLocal || !dateToLocal) {
      return "Период";
    }

    const dateFrom = dayjs(dateFromLocal).format("DD.MM");

    const dateTo = dayjs(dateToLocal)
      .subtract(1, "millisecond")
      .format("DD.MM");

    return `${dateFrom}-${dateTo}`;
  }

  const content = (
    <Flex vertical gap="middle" className={styles.popoverContent}>
      <RangePicker
        value={selectedRange}
        format="DD.MM.YYYY"
        disabledDate={disabledDate}
        allowClear
        onChange={handleRangeChange}
        placement="bottomLeft"
        classNames={{
          popup: {
            root: `${styles.rangePickerPopup} ${
              isMobile ? styles.rangePickerPopupMobile : ""
            }`,
          },
        }}
      />

      <Flex justify="flex-end" gap="small">
        <Button onClick={() => setIsOpen(false)}>Отмена</Button>

        <Button type="primary" disabled={!selectedRange} onClick={handleApply}>
          Применить
        </Button>
      </Flex>
    </Flex>
  );

  return (
    <Popover
      open={isOpen}
      onOpenChange={handleOpenChange}
      content={content}
      trigger="click"
      placement={isMobile ? "bottomRight" : "bottomLeft"}
      autoAdjustOverflow
      destroyOnHidden
      classNames={{
        root: `${styles.popoverPopup} ${
          isMobile ? styles.popoverPopupMobile : ""
        }`,
      }}
    >
      <Button
        type="default"
        className={`${styles.item} ${active ? styles.active : ""}`}
      >
        <span className={styles.content}>
          <Text className={styles.label}>{getPeriodLabel()}</Text>

          {active && amount && <Text className={styles.amount}>{amount}</Text>}
        </span>
      </Button>
    </Popover>
  );
}

export default CustomFilterGroupItem;
