import { h } from 'preact';
import { useCallback, useMemo } from 'preact/hooks';

import { GridHeader } from '@src/components/dayGridCommon/gridHeader';
import { AlldayGridRow } from '@src/components/dayGridWeek/alldayGridRow';
import { OtherGridRow } from '@src/components/dayGridWeek/otherGridRow';
import { Layout } from '@src/components/layout';
import { Panel } from '@src/components/panel';
import { TimeComparatorGrid } from "@src/components/timeGrid/timeComparatorGrid";
import { TimezoneLabels } from '@src/components/timeGrid/timezoneLabels';
import { WEEK_DAY_NAME_BORDER, WEEK_DAY_NAME_HEIGHT } from '@src/constants/style';
import { useStore } from '@src/contexts/calendarStore';
import { useTheme } from '@src/contexts/themeStore';
import { cls } from '@src/helpers/css';
import { getCreatorNames } from "@src/helpers/dayName";
import { createCreatorGridData, getComparatorDate, getWeekViewEvents } from "@src/helpers/grid";
import { getActivePanels } from '@src/helpers/view';
import { useCalendarData } from '@src/hooks/calendar/useCalendarData';
import { useDOMNode } from '@src/hooks/common/useDOMNode';
import { useTimeGridScrollSync } from '@src/hooks/timeGrid/useTimeGridScrollSync';
import { useTimezoneLabelsTop } from '@src/hooks/timeGrid/useTimezoneLabelsTop';
import {
  calendarSelector,
  optionsSelector,
  viewSelector,
  weekViewLayoutSelector,
} from '@src/selectors';
import { primaryTimezoneSelector } from '@src/selectors/timezone';
import { addDate, getCreatorRowStyleInfo, toEndOfDay, toStartOfDay } from "@src/time/datetime";
import { first, last } from '@src/utils/array';

import type { WeekOptions } from '@t/options';
import type { AlldayEventCategory } from '@t/panel';

function useWeekViewState() {
  const options = useStore(optionsSelector);
  const calendar = useStore(calendarSelector);
  const { dayGridRows: gridRowLayout, lastPanelType } = useStore(weekViewLayoutSelector);
  const { renderDate } = useStore(viewSelector);

  return useMemo(
    () => ({
      options,
      calendar,
      gridRowLayout,
      lastPanelType,
      renderDate,
    }),
    [calendar, gridRowLayout, lastPanelType, options, renderDate]
  );
}

export function DayComparator() {
  const { options, calendar, gridRowLayout, lastPanelType, renderDate } = useWeekViewState();
  const gridHeaderMarginLeft = useTheme(useCallback((theme) => theme.week.dayGridLeft.width, []));

  const primaryTimezoneName = useStore(primaryTimezoneSelector);

  const [timePanel, setTimePanelRef] = useDOMNode<HTMLDivElement>();

  const calendarData = useCalendarData(calendar, options.eventFilter);

  const weekOptions = options.week as Required<WeekOptions>;
  const narrowWeekend = false
  const {  hourStart, hourEnd, eventView, taskView } =
    weekOptions;
  const date = useMemo(() => getComparatorDate(renderDate, weekOptions), [renderDate, weekOptions]);
  const creatorNames = getCreatorNames(calendarData.events,renderDate);

  const { rowStyleInfo, cellWidthMap } = getCreatorRowStyleInfo(
    creatorNames
  );
  console.log('calendarData ',calendarData,rowStyleInfo,rowStyleInfo)
  const eventByPanel = useMemo(() => {
    const getFilterRange = () => {
      if (primaryTimezoneName === 'Local') {
        return [toStartOfDay(first(date)), toEndOfDay(last(date))];
      }

      // NOTE: Extend filter range because of timezone offset differences
      return [toStartOfDay(addDate(first(date), -1)), toEndOfDay(addDate(last(date), 1))];
    };

    const [weekStartDate, weekEndDate] = getFilterRange();

    return getWeekViewEvents(date, calendarData, {
      narrowWeekend,
      hourStart,
      hourEnd,
      weekStartDate,
      weekEndDate,
    });
  }, [calendarData, hourEnd, hourStart, narrowWeekend, primaryTimezoneName, date]);
  const names = creatorNames.map(creatorCol=>creatorCol.creatorName)
  const timeGridData = useMemo(
    () =>
      createCreatorGridData(date[0],names, {
        hourStart,
        hourEnd,
        narrowWeekend,
      }),
    [hourEnd, hourStart, narrowWeekend,names, date]
  );

  const activePanels = getActivePanels(taskView, eventView);
  const dayGridRows = activePanels.map((key) => {
    if (key === 'time') {
      return null;
    }

    const rowType = key as AlldayEventCategory;

    return (
      <Panel name={rowType} key={rowType} resizable={rowType !== lastPanelType}>
        {rowType === 'allday' ? (
          <AlldayGridRow
            events={eventByPanel[rowType]}
            rowStyleInfo={rowStyleInfo}
            gridColWidthMap={cellWidthMap}
            weekDates={date}
            height={gridRowLayout[rowType]?.height}
            options={weekOptions}
          />
        ) : (
          <OtherGridRow
            category={rowType}
            events={eventByPanel[rowType]}
            weekDates={date}
            height={gridRowLayout[rowType]?.height}
            options={weekOptions}
            gridColWidthMap={cellWidthMap}
          />
        )}
      </Panel>
    );
  });
  const hasTimePanel = useMemo(() => activePanels.includes('time'), [activePanels]);

  useTimeGridScrollSync(timePanel, timeGridData.rows.length);

  const stickyTop = useTimezoneLabelsTop(timePanel);

  return (
    <Layout className={cls('week-view')} autoAdjustPanels={true}>
      <Panel
        name="week-view-day-names"
        initialHeight={WEEK_DAY_NAME_HEIGHT + WEEK_DAY_NAME_BORDER * 2}
      >
        <GridHeader
          type="week"
          displayIndex={'creator'}
          dayNames={creatorNames}
          marginLeft={gridHeaderMarginLeft}
          options={weekOptions}
          rowStyleInfo={rowStyleInfo}
        />
      </Panel>
      {dayGridRows}
      {hasTimePanel ? (
        <Panel name="time" autoSize={1} ref={setTimePanelRef}>
          <TimeComparatorGrid events={eventByPanel.time} timeGridData={timeGridData} />
          <TimezoneLabels top={stickyTop} />
        </Panel>
      ) : null}
    </Layout>
  );
}
