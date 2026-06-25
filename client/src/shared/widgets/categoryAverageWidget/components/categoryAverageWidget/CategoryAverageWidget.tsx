import { useEffect, useState } from "react";

import PreviewWidget from "../../../previewWidget/components/PreviewWidget";
import useIsMobile from "../../../../../hooks/useIsMobile";

import CategoryWidjetAverageListItem, {
  type CategoryAverageWidgetDisplayItem,
} from "../categoryWidjetAverageListItem/CategoryWidjetAverageListItem";
import {
  getCategoryAverageWidget,
  type CategoryAverageWidgetResponse,
} from "../../api/getCategoryAverageWidget";
import CategoryWidjetAverageListHeader from "../categoryWidjetAverageListHeader/CategoryWidjetAverageListHeader";
import ModeSwitch from "../modeSwitch/ModeSwitch";
import { useOperationsStore } from "../../../../../store/operationsStore";
import { useProfileStore } from "../../../../../store/profileStore";
import { useFiltersStore } from "../../../../../store/filtersStore";

type AverageMode = "average" | "median";

type CategoryAverageWidgetProps = {
  reloadOnAccountChange: boolean;
};

function CategoryAverageWidget({
  reloadOnAccountChange = true,
}: CategoryAverageWidgetProps) {
  const { isMobile } = useIsMobile();
  const [mode, setMode] = useState<AverageMode>("average");

  const [widgetData, setWidgetData] =
    useState<CategoryAverageWidgetResponse | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const operationsRevision = useOperationsStore(
    (state) => state.operationsRevision
  );

  const accountId = useProfileStore((state) => state.account?.id ?? null);
  const groupsFilter = useFiltersStore((state) => state.groupsFilter);

  const activeFilter = groupsFilter?.find((filter) => filter.isActive) ?? null;

  const dateFromUTC = activeFilter?.dateFromUTC ?? null;
  const dateToUTC = activeFilter?.dateToUTC ?? null;

  const accountReloadKey = reloadOnAccountChange ? accountId : "Ignore-case";

  useEffect(() => {
    if (!dateFromUTC || !dateToUTC) return;

    if (reloadOnAccountChange && !accountId) return;

    let isCancelled = false;

    async function getWidget() {
      try {
        setIsLoading(true);

        const response = await getCategoryAverageWidget({
          dateFromUTC,
          dateToUTC,
        });

        if (isCancelled) return;

        setWidgetData(response.data);
      } catch (error) {
        if (isCancelled) return;

        console.error(error);
        setWidgetData(null);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    getWidget();

    return () => {
      isCancelled = true;
    };
  }, [
    dateFromUTC,
    dateToUTC,
    reloadOnAccountChange,
    operationsRevision,
    accountReloadKey,
  ]);

  if (!widgetData) return null;

  const categories: CategoryAverageWidgetDisplayItem[] = widgetData.categories;

  return (
    <PreviewWidget<CategoryAverageWidgetDisplayItem>
      isMobile={isMobile}
      title={widgetData.title}
      subTitles={widgetData.subTitles}
      isLoading={isLoading}
      items={categories}
      previewLimit={4}
      renderList={(items) => (
        <CategoryWidjetAverageListItem categories={items} mode={mode} />
      )}
      getPreviewItems={({ visibleItems, hiddenItems }) => {
        if (hiddenItems.length === 0) {
          return visibleItems;
        }

        return [
          ...visibleItems,
          {
            id: "OTHER",
            title: "Остальные категории",
            isOther: true,
          },
        ];
      }}
      listHeader={<CategoryWidjetAverageListHeader mode={mode} />}
      headerExtra={<ModeSwitch mode={mode} setMode={setMode} />}
    />
  );
}

export default CategoryAverageWidget;
