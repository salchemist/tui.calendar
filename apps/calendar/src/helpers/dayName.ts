import type EventModel from "@src/model/eventModel";
import type TZDate from '@src/time/date';
import type Collection from "@src/utils/collection";
import { isBetween } from "@src/utils/math";
import { capitalize } from '@src/utils/string';

import type { WeekOptions } from '@t/options';
import type { TemplateWeekDayName } from '@t/template';


export const DEFAULT_DAY_NAMES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export const getDayName = (dayIndex: number) => DEFAULT_DAY_NAMES[dayIndex];

export function getDayNames(
  days: TZDate[],
  weekDayNamesOption: Required<WeekOptions>['dayNames'] | []
) {
  return days.map<TemplateWeekDayName>((day) => {
    const dayIndex = day.getDay();
    const dayName =
      weekDayNamesOption.length > 0
        ? weekDayNamesOption[dayIndex]
        : capitalize(getDayName(dayIndex));

    return {
      date: day.getDate(),
      day: day.getDay(),
      dayName,
      isToday: true,
      renderDate: 'date',
      dateInstance: day,
    };
  });
}

export function getCreatorNames(
  events: Collection<EventModel>,
  renderDate:TZDate
) :TemplateWeekDayName[]{
  const dayNames:TemplateWeekDayName[] = []

  const creators = events
    .filter(event=>isBetween(renderDate.valueOf(),event.start.valueOf(),event.end.valueOf()))
    .groupBy(event=>event.raw.creator.name)
  Object.keys(creators).forEach(creator=>{
    dayNames.push( {
      date: renderDate.getDate(),
      day: renderDate.getDay(),
      dayName:creator,
      isToday: true,
      renderDate: 'date',
      dateInstance: renderDate,
    })
  })


  return dayNames
}
