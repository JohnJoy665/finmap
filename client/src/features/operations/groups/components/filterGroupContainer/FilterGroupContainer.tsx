import type {
  CustomGroupFilter,
  FilterItem,
  GroupFilterValue,
} from "../../../../../shared/types/group.types";
import {
  fromMinorToMajorFormated,
  fromMinorToMajorNormalize,
} from "../../../../../utils/toMinorAmount";
import CustomFilterGroupItem from "../customFilterGroupItem/CustomFilterGroupItem";
import FilterGroupItem from "../filterGroupItem/FilterGroupItem";
import styles from "./FilterGroupContainer.module.css";

type FilterGroupContainerProps = {
  onChange: (value: GroupFilterValue) => void;
  onCustomApply: (period: CustomGroupFilter) => void;
  filters: FilterItem[];
  conversionFactor: number;
  customGroupFilter: CustomGroupFilter | null;
  minDateLocal: string | null;
  maxDateLocal: string | null;
};

function getFormattedAmount(amount: string | null, conversionFactor: number) {
  if (!amount) {
    return null;
  }

  return Number(amount) < 10000
    ? fromMinorToMajorNormalize(amount, conversionFactor)
    : fromMinorToMajorFormated(amount, conversionFactor);
}

function FilterGroupContainer({
  onChange,
  onCustomApply,
  filters,
  conversionFactor,
  customGroupFilter,
  minDateLocal,
  maxDateLocal,
}: FilterGroupContainerProps) {
  return (
    <div className={styles.container}>
      {filters.map((filter) => {
        if (filter.value === "custom") {
          return (
            <CustomFilterGroupItem
              key={filter.value}
              active={filter.isActive}
              initialPeriod={customGroupFilter}
              onApply={onCustomApply}
              minDateLocal={minDateLocal}
              maxDateLocal={maxDateLocal}
              dateFromLocal={filter.dateFromLocal}
              dateToLocal={filter.dateToLocal}
              amount={getFormattedAmount(filter.amount, conversionFactor)}
            />
          );
        }

        if (filter.daysInPeriod === null) {
          return null;
        }

        return (
          <FilterGroupItem
            key={filter.value}
            value={filter.value}
            countDays={filter.daysInPeriod}
            amount={
              getFormattedAmount(filter.amount, conversionFactor) ?? "No data"
            }
            active={filter.isActive}
            onClick={() => onChange(filter.value)}
          />
        );
      })}
    </div>
  );
}

export default FilterGroupContainer;
