import { useEffect, useState } from "react";

import PreviewWidget from "../../../previewWidget/components/PreviewWidget";
import useIsMobile from "../../../../../hooks/useIsMobile";

import { useOperationsStore } from "../../../../../store/operationsStore";
import { useProfileStore } from "../../../../../store/profileStore";
import { useFiltersStore } from "../../../../../store/filtersStore";
import {
  getGroupAverageWidget,
  type GroupAverageWidgetResponse,
} from "../../api/getGroupAverageWidget";
import type { AverageWidgetDisplayItem } from "../../../widjetAverageListItem/WidjetAverageListItem";
import WidjetAverageListItem from "../../../widjetAverageListItem/WidjetAverageListItem";
import ModeSwitch from "../../../categoryAverageWidget/components/modeSwitch/ModeSwitch";
import WidjetAverageListHeader from "../../../categoryAverageWidget/components/WidjetAverageListHeader/WidjetAverageListHeader";

type AverageMode = "average" | "median";

type GroupAverageWidgetProps = {
  reloadOnAccountChange: boolean;
};

function GroupAverageWidget({
  reloadOnAccountChange = true,
}: GroupAverageWidgetProps) {
  const { isMobile } = useIsMobile();
  const [mode, setMode] = useState<AverageMode>("average");

  const [widgetData, setWidgetData] =
    useState<GroupAverageWidgetResponse | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const operationsRevision = useOperationsStore(
    (state) => state.operationsRevision
  );

  const accountId = useProfileStore((state) => state.account?.id ?? null);
  const groupsFilter = useFiltersStore((state) => state.groupsFilter);

  const activeFilter = groupsFilter?.find((filter) => filter.isActive) ?? null;

  const dateFromUTC = activeFilter?.dateFromUTC ?? null;
  const dateToUTC = activeFilter?.dateToUTC ?? null;
  const dateFromLocal = activeFilter?.dateFromLocal ?? null;
  const dateToLocal = activeFilter?.dateToLocal ?? null;

  const accountReloadKey = reloadOnAccountChange ? accountId : "Ignore-case";

  useEffect(() => {
    if (!dateFromUTC || !dateToUTC || !dateFromLocal || !dateToLocal) return;

    if (reloadOnAccountChange && !accountId) return;

    let isCancelled = false;

    async function getWidget() {
      try {
        setIsLoading(true);
        if (!dateFromUTC || !dateToUTC || !dateFromLocal || !dateToLocal)
          return;
        const response = await getGroupAverageWidget({
          dateFromUTC,
          dateToUTC,
          dateFromLocal,
          dateToLocal,
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

  const categories: AverageWidgetDisplayItem[] = widgetData.categories;

  return (
    <PreviewWidget<AverageWidgetDisplayItem>
      isMobile={isMobile}
      title={widgetData.title}
      subTitles={widgetData.subTitles}
      isLoading={isLoading}
      items={categories}
      previewLimit={4}
      renderList={(items) => (
        <WidjetAverageListItem categories={items} mode={mode} />
      )}
      getPreviewItems={({ visibleItems, hiddenItems }) => {
        if (hiddenItems.length === 0) {
          return visibleItems;
        }

        return [
          ...visibleItems,
          {
            id: "OTHER",
            title: "Остальные группы",
            isOther: true,
          },
        ];
      }}
      listHeader={<WidjetAverageListHeader mode={mode} />}
      headerExtra={<ModeSwitch mode={mode} setMode={setMode} />}
    />
  );
}

export default GroupAverageWidget;
