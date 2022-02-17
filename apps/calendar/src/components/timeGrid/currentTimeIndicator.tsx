import { h } from 'preact';

import { addTimeGridPrefix } from '@src/components/timeGrid';
import { cls, toPercent } from '@src/helpers/css';

const classNames = {
  line: cls(addTimeGridPrefix('current-time-line')),
  left: cls(addTimeGridPrefix('current-time-line-left')),
  marker: cls(addTimeGridPrefix('current-time-line-marker')),
  today: cls(addTimeGridPrefix('current-time-line-today')),
  right: cls(addTimeGridPrefix('current-time-line-right')),
};

interface Props {
  top: number;
  columnWidth: number;
  columnCount: number;
  columnIndex: number;
}

export function CurrentTimeIndicator({ top, columnWidth, columnCount, columnIndex }: Props) {
  const leftLine = {
    left: toPercent(columnWidth * columnIndex),
    width: toPercent(columnWidth * columnIndex),
  };
  const rightLine = {
    left: toPercent(columnWidth * (columnIndex + 1)),
    width: toPercent(columnWidth * (columnCount - columnIndex + 1)),
  };

  const currentTimeLeftBorderTop = '1px dashed #515ce6';
  const currentTimeBulletBackgroundColor = '#515ce6';
  const currentTimeTodayBorderTop = '1px solid #515ce6';
  const currentTimeRightBorderTop = 'none';

  return (
    <div
      className={classNames.line}
      style={{ top: toPercent(top) }}
      data-testid="timegrid-current-time-line"
    >
      <div
        className={classNames.left}
        style={{ width: leftLine.width, borderTop: currentTimeLeftBorderTop }}
      />
      <div
        className={classNames.marker}
        style={{ left: leftLine.left, backgroundColor: currentTimeBulletBackgroundColor }}
      />
      <div
        className={classNames.today}
        style={{
          left: leftLine.left,
          width: toPercent(columnWidth),
          borderTop: currentTimeTodayBorderTop,
        }}
      />
      <div
        className={classNames.right}
        style={{
          left: rightLine.left,
          borderTop: currentTimeRightBorderTop,
        }}
      />
    </div>
  );
}