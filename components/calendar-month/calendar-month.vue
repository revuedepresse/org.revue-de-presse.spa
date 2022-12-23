<template>
  <div class="calendar-month">
    <div
      class="calendar-month__buttons"
      :style="pickItemIcon"
    >
      <div
        class="calendar-month__container"
        @click="switchToMonthPicking"
      >
        <button
          class="calendar-month__button"
          @click="switchToMonthPicking"
          v-text="monthYearLabel"
        />
      </div>
      <div class="calendar-month__navigation">
        <button
          :class="getPreviousItemClasses()"
          :style="previousItemIcon"
          @click="goToPreviousMonth()"
        />
        <button
          :class="getNextItemClasses()"
          :style="nextItemIcon"
          @click="goToNextMonth()"
        />
      </div>
    </div>
    <table class="calendar-month__days">
      <thead class="calendar-month__day-names">
        <tr class="calendar-month__day-row">
          <th
            v-for="(day, dayIndex) in days"
            :key="dayIndex"
            class="calendar-month__day-col"
          >
            <span
              class="calendar-month__day-name"
              v-text="day"
            />
          </th>
        </tr>
      </thead>
      <tbody class="calendar-month__day-numbers">
        <tr
          v-for="(rowNumber, rowIndex) in dayRows()"
          :key="rowIndex"
          class="calendar-month__day-row"
        >
          <td
            v-for="(weekDay, dayPos) in dayNumbers(rowNumber)"
            :key="dayPos"
            :class="weekDayClasses(weekDay)"
          >
            <a
              class="calendar-month__day-cell"
              @click="pickDate(weekDay)"
              v-text="weekDay.getDate()"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { Component, Prop, mixins, namespace } from 'nuxt-property-decorator'
import DateMixin from '../../mixins/date'
import NavMixin from '../../mixins/nav'
import Time from '../../modules/time'
import NextItemIcon from '~/assets/icons/icon-next-item.svg'
import NextItemActiveIcon from '~/assets/icons/icon-next-item-active.svg'
import NextItemDisabledIcon from '~/assets/icons/icon-next-item-disabled.svg'
import NextItemHoverIcon from '~/assets/icons/icon-next-item-hover.svg'
import PickItemIcon from '~/assets/icons/icon-pick-item.svg'
import PreviousItemIcon from '~/assets/icons/icon-previous-item.svg'
import PreviousItemActiveIcon from '~/assets/icons/icon-previous-item-active.svg'
import PreviousItemDisabledIcon from '~/assets/icons/icon-previous-item-disabled.svg'
import PreviousItemHoverIcon from '~/assets/icons/icon-previous-item-hover.svg'

const DatePickerStore = namespace('date-picker')

@Component
class CalendarMonth extends mixins(DateMixin, NavMixin) {
  @Prop({
    type: Boolean,
    default: false
  })
  isNextItemAvailable!: boolean

  @Prop({
    type: Boolean,
    default: false
  })
  isPreviousItemAvailable!: boolean

  @Prop({
    type: Date,
    required: true
  })
  pickedDate!: Date

  @Prop({
    type: Number,
    required: true
  })
  month!: number

  @Prop({
    type: Number,
    required: true
  })
  year!: number

  days: String[] = ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.']

  @DatePickerStore.Mutation
  public pickMonth!: () => void

  @DatePickerStore.Mutation
  public resetDatePicker!: () => void

  switchToMonthPicking (): void {
    this.pickMonth()
  }

  get previousItemIcon () {
    const widthOrHeight = '32px'

    return `
      --icon-previous-item-background: center / ${widthOrHeight} no-repeat url("${PreviousItemIcon}");
      --icon-previous-item-active-background: center / ${widthOrHeight} no-repeat url("${PreviousItemActiveIcon}");
      --icon-previous-item-disabled-background: center / ${widthOrHeight} no-repeat url("${PreviousItemDisabledIcon}");
      --icon-previous-item-hover-background: center / ${widthOrHeight} no-repeat url("${PreviousItemHoverIcon}");
      --icon-previous-item-height: ${widthOrHeight};
      --icon-previous-item-width: ${widthOrHeight}
    `
  }

  get nextItemIcon () {
    const widthOrHeight = '32px'

    return `
      --icon-next-item-background: center / ${widthOrHeight} no-repeat url("${NextItemIcon}");
      --icon-next-item-active-background: center / ${widthOrHeight} no-repeat url("${NextItemActiveIcon}");
      --icon-next-item-disabled-background: center / ${widthOrHeight} no-repeat url("${NextItemDisabledIcon}");
      --icon-next-item-hover-background: center / ${widthOrHeight} no-repeat url("${NextItemHoverIcon}");
      --icon-next-item-height: ${widthOrHeight};
      --icon-next-item-width: ${widthOrHeight}
    `
  }

  get monthYearLabel () {
    return `${this.getMonths[this.month]} ${this.year}`
  }

  get pickItemIcon () {
    const widthOrHeight = '20px'

    return `
      --icon-pick-item-background: center / ${widthOrHeight} no-repeat url("${PickItemIcon}");
      --icon-pick-item-height: ${widthOrHeight};
      --icon-pick-item-width: ${widthOrHeight}
    `
  }

  get dayBeforePickedDate (): Date {
    const pickedDate = new Date(this.pickedDate.getTime())
    pickedDate.setDate(pickedDate.getDate() - 1)

    return pickedDate
  }

  get dayFollowingPickedDate (): Date {
    const pickedDate = new Date(this.pickedDate.getTime())
    pickedDate.setDate(pickedDate.getDate() + 1)

    return pickedDate
  }

  get previousMonth (): Date {
    return this.getPreviousMonth(this.month, this.year)
  }

  get nextMonth (): Date {
    return this.getNextMonth(this.month, this.year)
  }

  dateOfFirstVisibleDay () {
    let firstVisibleDayCandidate = this.nameOfFirstDayOfMonth()

    const dateCandidate = new Date(this.year, this.month, 1)

    this.guardAgainstMissingMonthOrYear(firstVisibleDayCandidate)

    while (firstVisibleDayCandidate !== 'Lun.') {
      dateCandidate.setDate(dateCandidate.getDate() - 1)
      firstVisibleDayCandidate = this.whichDayOfWeek(dateCandidate.getDay())
    }

    return dateCandidate
  }

  dateOfLastVisibleDay () {
    let lastVisibleDayCandidate = this.nameOfLastDayOfMonth()
    const dateCandidate = new Date(this.year, this.month, this.totalDaysInMonth())

    this.guardAgainstMissingMonthOrYear(lastVisibleDayCandidate)

    while (lastVisibleDayCandidate !== 'Dim.') {
      dateCandidate.setDate(dateCandidate.getDate() + 1)
      lastVisibleDayCandidate = this.whichDayOfWeek(dateCandidate.getDay())
    }

    return dateCandidate
  }

  dayNumbers (rowNumber: number) {
    const shift = (rowNumber - 1) * 7

    const week = (new Array(7))
      .fill('', 0, 7)
      .map((_, index) => {
        const dayOfWeek = new Date(this.dateOfFirstVisibleDay().getTime())
        dayOfWeek.setDate(dayOfWeek.getDate() + index + shift)
        return dayOfWeek
      })

    return week
  }

  goToPreviousMonth () {
    if (!this.isPreviousItemAvailable) {
      return
    }

    this.pickDate(this.previousMonth)
  }

  goToNextMonth () {
    if (!this.isNextItemAvailable) {
      return
    }

    this.pickDate(this.nextMonth)
  }

  nameOfFirstDayOfMonth () {
    return this.daysOfWeek[new Date(this.year, this.month, 1).getDay()]
  }

  nameOfLastDayOfMonth () {
    const lastDayNumberOfMonth = this.totalDaysInMonth()

    return this.whichDayOfWeek(new Date(this.year, this.month, lastDayNumberOfMonth).getDay())
  }

  totalDaysInMonth (): number {
    return new Date(this.year, this.month + 1, 0).getDate()
  }

  totalDaysInPreviousMonth (): number {
    return new Date(this.year, this.month, 0).getDate()
  }

  dayRows () {
    let dateOfFirstVisibleDay

    try {
      dateOfFirstVisibleDay = this.dateOfFirstVisibleDay()
    } catch (e) {
      return
    }

    let daysBeforeSelectedMonth = 0
    if (dateOfFirstVisibleDay.getMonth() !== this.month) {
      daysBeforeSelectedMonth = this.totalDaysInPreviousMonth() - dateOfFirstVisibleDay.getDate() + 1
    }

    let dateOfLastVisibleDay

    try {
      dateOfLastVisibleDay = this.dateOfLastVisibleDay()
    } catch (e) {
      return
    }

    let daysAfterSelectedMonth = 0
    if (dateOfLastVisibleDay.getMonth() !== this.month) {
      daysAfterSelectedMonth = dateOfLastVisibleDay.getDate()
    }

    return (
      daysBeforeSelectedMonth +
      this.totalDaysInMonth() +
      daysAfterSelectedMonth
    ) / 7
  }

  getNextItemClasses () {
    return {
      'calendar-month__next-item': true,
      'calendar-month__next-item--disabled': !this.isNextItemAvailable
    }
  }

  getPreviousItemClasses () {
    return {
      'calendar-month__previous-item': true,
      'calendar-month__previous-item--disabled': !this.isPreviousItemAvailable
    }
  }

  pickDate (date: Date) {
    /**
     * Back to the Future is a 1985 American science fiction film directed by Robert Zemeckis, and written by
     * Zemeckis and Bob Gale. It stars Michael J. Fox, Christopher Lloyd, Lea Thompson, Crispin Glover, and Thomas F.
     * Wilson. Set in 1985, the story follows Marty McFly (Fox), a teenager accidentally sent back to 1955 in a
     * time-traveling DeLorean automobile built by his eccentric scientist friend Emmett "Doc" Brown (Lloyd).
     * While in the past, Marty inadvertently prevents his future parents from falling in love—threatening
     * his existence—and is forced to reconcile the pair and somehow get back to the future.
     *
     * See https://w.wiki/3hrj
     */
    const cannotFindDeLorean = date > new Date()

    if (cannotFindDeLorean) {
      return
    }

    const startDate = Time.formatDate(date)

    this.navigateToReviewFor(startDate, () => this.resetDatePicker())
  }

  weekDayClasses (weekDay?: Date) {
    const defaultClass = 'calendar-month__day-number'

    if (!(weekDay instanceof Date)) {
      return {
        [defaultClass]: true
      }
    }

    return {
      [defaultClass]: true,
      'calendar-month__day-number--selected': this.formatDate(this.pickedDate) === this.formatDate(weekDay),
      'calendar-month__day-number--other-month': weekDay.getMonth() !== this.month,
      'calendar-month__day-number--future-dates': weekDay > new Date()
    }
  }
}

export default CalendarMonth
</script>

<style lang="scss" scoped>
@import './calendar-month.scss';
</style>
