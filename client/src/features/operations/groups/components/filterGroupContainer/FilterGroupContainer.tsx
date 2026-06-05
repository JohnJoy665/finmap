import {
  fromMinorToMajorFormated,
  fromMinorToMajorNormalize,
} from "../../../../../utils/toMinorAmount";
import FilterGroupItem from "../filterGroupItem/FilterGroupItem";
import styles from "./FilterGroupContainer.module.css";

export type GroupFilterValue = "today" | "week" | "month" | "year";

type FilterItem = {
  value: GroupFilterValue;
  label: string;
  amount?: string;
  isActive: boolean;
};

type FilterGroupContainerProps = {
  onChange: (value: GroupFilterValue) => void;
  filters: FilterItem[];
  conversionFactor: number;
};

function FilterGroupContainer({
  onChange,
  filters,
  conversionFactor,
}: FilterGroupContainerProps) {
  return (
    <div className={styles.container}>
      {filters.map((filter) => (
        <FilterGroupItem
          key={filter.value}
          label={filter.label}
          amount={
            Number(filter.amount) < 10000
              ? fromMinorToMajorNormalize(filter.amount, conversionFactor)
              : fromMinorToMajorFormated(filter.amount, conversionFactor)
          }
          active={filter.isActive}
          onClick={() => onChange(filter.value)}
        />
      ))}
    </div>
  );
}

export default FilterGroupContainer;
