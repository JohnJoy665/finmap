import { useState, type ReactNode } from "react";
import { Button, Card, Skeleton } from "antd";

import styles from "./PreviewWidget.module.css";
import WidjetPanel from "../widjetPanel/WidjetPanel";

type WidgetSubTitle = {
  subTitle: string;
  value: string | number;
};

type GetPreviewItemsParams<Item> = {
  items: Item[];
  visibleItems: Item[];
  hiddenItems: Item[];
};

type PreviewWidgetProps<Item> = {
  title: string;
  subTitles: WidgetSubTitle[];
  items?: Item[];
  isLoading: boolean;
  previewLimit?: number;
  renderList: (items: Item[]) => ReactNode;
  isMobile: boolean;
  getPreviewItems?: (params: GetPreviewItemsParams<Item>) => Item[];
};

function PreviewWidget<Item>({
  title,
  subTitles,
  items = [],
  isLoading,
  previewLimit = 6,
  renderList,
  getPreviewItems,
  isMobile,
}: PreviewWidgetProps<Item>) {
  const [isOpen, setIsOpen] = useState(false);

  const visibleItems = items.slice(0, previewLimit);
  const hiddenItems = items.slice(previewLimit);

  const hasHiddenItems = hiddenItems.length > 0;

  const previewItems = getPreviewItems
    ? getPreviewItems({
        items,
        visibleItems,
        hiddenItems,
      })
    : visibleItems;

  const displayedItems = isOpen && isMobile ? items : previewItems;

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
          <WidjetPanel
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
              renderList(displayedItems)
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
            <WidjetPanel
              title={title}
              subTitles={subTitles}
              isLoading={isLoading}
            />

            <div className={styles.overlayBody}>{renderList(items)}</div>

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

export default PreviewWidget;
