import { h } from 'preact';

import { DayComparator as Comparator } from '@src/components/view/dayComparator';
import CalendarCore from '@src/factory/calendarCore';

import type { Options } from '@t/options';

export default class DayComparator extends CalendarCore {
  constructor(container: Element, options: Options = {}) {
    super(container, options);

    this.render();
  }

  protected getComponent() {
    return <Comparator />;
  }
}
