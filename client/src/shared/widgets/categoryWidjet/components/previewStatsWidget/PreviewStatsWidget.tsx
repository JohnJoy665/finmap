import { useState } from "react";
import { Button, Card, Skeleton } from "antd";

import type {
  CategoryStatisticsWidgetItem,
  CategoryStatisticsWidgetSubTitle,
} from "../../api/getCategoryStatisticsWidget";

import CategoryWidjetPanel from "../categoryWidjetPanel/CategoryWidjetPanel";
import CategoryWidjetListItem, {
  type CategoryWidgetDisplayItem,
} from "../categoryWidjetListItem/CategoryWidjetListItem";

import styles from "./PreviewStatsWidget.module.css";

type PreviewStatsWidgetProps = {
  title: string;
  subTitles: CategoryStatisticsWidgetSubTitle[];
  categories?: CategoryStatisticsWidgetItem[];
  isLoading: boolean;
  previewLimit?: number;
};

function PreviewStatsWidget({
  title,
  subTitles,
  categories = [],
  isLoading,
  previewLimit = 6,
}: PreviewStatsWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Временно обычная переменная.
  // Потом заменишь на useMediaQuery / Zustand / пропс.
  const isMobile = false;

  const visibleCategories = categories.slice(0, previewLimit);
  const hiddenCategories = categories.slice(previewLimit);

  const hasHiddenItems = hiddenCategories.length > 0;

  const otherPercent = hiddenCategories.reduce(
    (sum, item) => sum + Number(item.percent || 0),
    0
  );

  const otherAmount = hiddenCategories
    .reduce((sum, item) => {
      if (item.amount === null) return sum;

      return sum + Number(item.amount);
    }, 0)
    .toString();

  const firstCategory = categories[0];

  const previewCategories: CategoryWidgetDisplayItem[] = hasHiddenItems
    ? [
        ...visibleCategories,
        {
          id: "OTHER",
          title: "Остальные категории",
          amount: otherAmount,
          percent: Number(otherPercent.toFixed(1)),
          currencyCode: firstCategory?.currencyCode ?? "",
          conversionFactor: firstCategory?.conversionFactor ?? 100,
          isOther: true,
        },
      ]
    : visibleCategories;

  const displayedCategories =
    isOpen && isMobile ? categories : previewCategories;

  function handleToggleOpen() {
    setIsOpen((prev) => !prev);
  }

  return (
    <div className={styles.root}>
      <Card
        className={styles.widget}
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        <div className={styles.content}>
          <CategoryWidjetPanel
            title={title}
            subTitles={subTitles}
            isLoading={isLoading}
          />

          <div className={styles.body}>
            {isLoading ? (
              <Skeleton
                active
                paragraph={{ rows: previewLimit }}
                title={false}
              />
            ) : (
              <CategoryWidjetListItem categories={displayedCategories} />
            )}
          </div>

          {hasHiddenItems && !isLoading ? (
            <div className={styles.footer}>
              <Button
                type="link"
                size="small"
                className={styles.showMoreButton}
                onClick={handleToggleOpen}
              >
                {isOpen && isMobile ? "Скрыть" : "Показать всё"}
              </Button>
            </div>
          ) : null}
        </div>
      </Card>

      {isOpen && !isMobile && hasHiddenItems && !isLoading ? (
        <Card
          className={styles.overlay}
          styles={{
            body: {
              padding: 0,
            },
          }}
        >
          <div className={styles.overlayContent}>
            <CategoryWidjetPanel
              title={title}
              subTitles={subTitles}
              isLoading={isLoading}
            />

            <div className={styles.overlayBody}>
              <CategoryWidjetListItem categories={categories} />
            </div>

            <div className={styles.footer}>
              <Button
                type="link"
                size="small"
                className={styles.showMoreButton}
                onClick={handleToggleOpen}
              >
                Скрыть
              </Button>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

export default PreviewStatsWidget;
