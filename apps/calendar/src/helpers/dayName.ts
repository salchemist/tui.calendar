import type EventModel from "@src/model/eventModel";
import type TZDate from '@src/time/date';
import type Collection from "@src/utils/collection";
import { capitalize } from '@src/utils/string';

import type { WeekOptions } from '@t/options';
import type { TemplateWeekDayName } from '@t/template';
import type { TemplateDayComparatorName } from "@t/template";


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
) :TemplateDayComparatorName[]{
  const dayNames:TemplateDayComparatorName[] = []

  const creators = events
    .groupBy(event=>event.raw.creator.name)
  Object.keys(creators).forEach(creator=>{
    dayNames.push( {
      date: renderDate.getDate(),
      day: renderDate.getDay(),
      creatorName:creator,
      dayName:renderDate.getDay().toString(),
      isToday: true,
      renderDate: 'date',
      dateInstance: renderDate,
    })
  })


  return dayNames
}
