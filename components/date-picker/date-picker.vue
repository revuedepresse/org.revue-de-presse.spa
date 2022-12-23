<template>
  <div class="date-picker">
    <div class="date-picker__pickers">
      <YearPicker
        v-show="pickingYear"
        :year="startDateYear"
        :starting-year="startDateYear"
        :is-next-item-available="isNextYearAvailable()"
        :is-previous-item-available="isPreviousYearAvailable()"
      />
      <MonthPicker
        v-show="pickingMonth"
        :month="startDateMonth"
        :year="startDateYear"
        :is-next-item-available="isNextMonthAvailable()"
        :is-previous-item-available="isPreviousMonthAvailable()"
        :visible-days-interval="visibleDaysInterval()"
      />
      <CalendarMonth
        v-show="pickingDay"
        :month="startDateMonth"
        :picked-date="new Date(startDate)"
        :year="startDateYear"
        :is-next-item-available="isNextMonthAvailable()"
        :is-previous-item-available="isPreviousMonthAvailable()"
      />
    </div>
    <div
      class="date-picker__buttons"
      :style="calendarIcon"
    >
      <div
        :class="datePickerClasses()"
        :data-disabled="disabled"
        @click="pickDate()"
        @mouseout="releaseDate()"
      >
        <button
          class="date-picker__button"
          :disabled="disabled"
          @click="pickDate()"
          v-text="startDateLabel"
        />
      </div>

      <div class="date-picker__navigation">
        <button
          :class="getPreviousDayClasses()"
          :style="previousDayIcon"
          @click="goToDayBeforePickedDate()"
        />
        <button
          :class="getNextDayClasses()"
          :style="nextDayIcon"
          @click="goToDayFollowingPickedDate()"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, mixins, namespace } from 'nuxt-property-decorator'
import CalendarMonth from '../calendar-month/calendar-month.vue'
import MonthPicker from '../month-picker/month-picker.vue'
import YearPicker from '../year-picker/year-picker.vue'
import DateMixin from '../../mixins/date'
import NavMixin from '../../mixins/nav'
import CalendarIcon from '~/assets/icons/icon-pick-day.svg'
import PreviousDayActiveIcon from '~/assets/icons/icon-previous-day-active.svg'
import PreviousDayDisabledIcon from '~/assets/icons/icon-previous-day-disabled.svg'
import PreviousDayHoverIcon from '~/assets/icons/icon-previous-day-hover.svg'
import PreviousDayIcon from '~/assets/icons/icon-previous-day.svg'
import NextDayIcon from '~/assets/icons/icon-next-day.svg'
import NextDayActiveIcon from '~/assets/icons/icon-next-day-active.svg'
import NextDayDisabledIcon from '~/assets/icons/icon-next-day-disabled.svg'
import NextDayHoverIcon from '~/assets/icons/icon-next-day-hover.svg'
import Time from '~/modules/time'

const DatePickerStore = namespace('date-picker')

@Component({
  components: { CalendarMonth, MonthPicker, YearPicker }
})
export default class DatePicker extends mixins(DateMixin, NavMixin) {
  @Prop({
    type: String,
    required: true
  })
  startDate!: string

  startDateLabel: string = this.refreshStartDateLabel(this.startDate)

  pickedDate: boolean = false

  @DatePickerStore.Getter
  public pickingDay!: boolean

  @DatePickerStore.Getter
  public pickingMonth!: boolean

  @DatePickerStore.Getter
  public pickingYear!: boolean

  @DatePickerStore.Mutation
  public pickDay!: () => void

  @DatePickerStore.Mutation
  public resetDatePicker!: () => void

  switchToDayPicking (): void {
    this.pickDay()
  }

  get calendarIcon () {
    const widthOrHeight = '19px'

    return `
      --icon-calendar-background: center / ${widthOrHeight} no-repeat url("${CalendarIcon}");
      --icon-calendar-height: ${widthOrHeight};
      --icon-calendar-width: ${widthOrHeight}
    `
  }

  get dayBeforePickedDate (): Date {
    const startDate = new Date(this.startDate)
    const pickedDate = new Date(startDate.getTime())
    pickedDate.setDate(pickedDate.getDate() - 1)

    return pickedDate
  }

  get dayFollowingPickedDate (): Date {
    const startDate = new Date(this.startDate)
    const pickedDate = new Date(startDate.getTime())
    pickedDate.setDate(pickedDate.getDate() + 1)

    return pickedDate
  }

  get disabled (): boolean {
    return this.pickingDay
  }

  get previousDayIcon () {
    const widthOrHeight = '32px'

    return `
      --icon-previous-day-background: center / ${widthOrHeight} no-repeat url("${PreviousDayIcon}");
      --icon-previous-day-background-active: center / ${widthOrHeight} no-repeat url("${PreviousDayActiveIcon}");
      --icon-previous-day-background-disabled: center / ${widthOrHeight} no-repeat url("${PreviousDayDisabledIcon}");
      --icon-previous-day-background-hover: center / ${widthOrHeight} no-repeat url("${PreviousDayHoverIcon}");
      --icon-previous-day-height: ${widthOrHeight};
      --icon-previous-day-width: ${widthOrHeight}
    `
  }

  get nextDayIcon () {
    const widthOrHeight = '32px'

    return `
      --icon-next-day-background: center / ${widthOrHeight} no-repeat url("${NextDayIcon}");
      --icon-next-day-background-hover: center / ${widthOrHeight} no-repeat url("${NextDayHoverIcon}");
      --icon-next-day-background-disabled: center / ${widthOrHeight} no-repeat url("${NextDayDisabledIcon}");
      --icon-next-day-background-active: center / ${widthOrHeight} no-repeat url("${NextDayActiveIcon}");
      --icon-next-day-height: ${widthOrHeight};
      --icon-next-day-width: ${widthOrHeight}
    `
  }

  get startDateMonth (): number {
    return this.getStartDateMonth(this.startDate)
  }

  get startDateYear (): number {
    return this.getStartDateYear(this.startDate)
  }

  get month () {
    return this.startDateMonth
  }

  get year () {
    return this.startDateYear
  }

  goToDayFollowingPickedDate () {
    if (!this.isNextDayAvailable()) {
      return
    }

    this.changeDate(this.dayFollowingPickedDate)
  }

  goToDayBeforePickedDate () {
    if (!this.isPreviousDayAvailable()) {
      return
    }

    this.changeDate(this.dayBeforePickedDate)
  }

  mounted () {
    if (this.$device.isDesktop) {
      this.switchToDayPicking()
    }
  }

  getNextDayClasses () {
    return {
      'date-picker__next-day': true,
      'date-picker__next-day--disabled': !this.isNextDayAvailable()
    }
  }

  getPreviousDayClasses () {
    return {
      'date-picker__previous-day': true,
      'date-picker__previous-day--disabled': !this.isPreviousDayAvailable()
    }
  }

  getEarliestCurationYear(): Number {
    return this.earliestTweetsCurationYear();
  }

  getEarliestCurationMonth(): Number {
    return this.earliestTweetsCurationMonth() - 1;
  }

  getEarliestCurationDay(): Number {
    return this.earliestTweetsCurationDay();
  }

  isNextDayAvailable () {
    const today = new Date()
    const sinceDate = new Date(this.startDate)

    if (
      sinceDate.getFullYear() >= this.getEarliestCurationYear() &&
      sinceDate.getFullYear() < today.getFullYear()) {
      return true
    }

    if (sinceDate.getFullYear() < this.getEarliestCurationYear()) {
      if (sinceDate.getMonth() < 11) {
        return false
      }

      return sinceDate.getDate() === 31
    }

    if (sinceDate.getMonth() < today.getMonth()) {
      return true
    }

    if (sinceDate.getMonth() > today.getMonth()) {
      return false
    }

    return sinceDate.getDate() < today.getDate()
  }

  isPreviousDayAvailable () {
    const today = new Date()
    const sinceDate = new Date(this.startDate)

    if (sinceDate.getFullYear() < this.getEarliestCurationYear()) {
      return false
    }

    if (sinceDate.getFullYear() === this.getEarliestCurationYear()) {
        if (sinceDate.getMonth() === this.getEarliestCurationMonth()) {
          return sinceDate.getDate() > this.getEarliestCurationDay()
        }
    }

    if (sinceDate.getFullYear() === today.getFullYear()) {
      if (sinceDate.getMonth() < today.getMonth()) {
        return true
      }

      return sinceDate.getDate() <= today.getDate() + 1
    }

    if (
      sinceDate.getFullYear() > this.getEarliestCurationYear() &&
      sinceDate.getFullYear() < today.getFullYear()) {
      return true
    }

    if (sinceDate.getMonth() > 0) {
      return true
    }

    return sinceDate.getDate() > this.getEarliestCurationDay()
  }

  isNextYearAvailable () {
    const today = new Date()

    return this.startDateYear >= 2017 && this.startDateYear < today.getFullYear()
  }

  isPreviousYearAvailable () {
    const today = new Date()

    return this.startDateYear > this.getEarliestCurationYear() && this.startDateYear <= today.getFullYear() + 1
  }

  isNextMonthAvailable () {
    const today = new Date()

    if (this.startDateYear >= this.getEarliestCurationYear() && this.startDateYear < today.getFullYear()) {
      // The next month belongs to
      // a year before or equal to
      // the year following the current one
      return true
    }

    // The next month is before or equal
    // to the current month
    return this.startDateMonth + 1 <= today.getMonth()
  }

  isPreviousMonthAvailable () {
    const today = new Date()

    if (this.startDateYear > this.getEarliestCurationYear() && this.startDateYear <= today.getFullYear()) {
      return true
    }

    return this.startDateMonth > this.getEarliestCurationMonth()
  }

  changeDate (date: Date) {
    const startDate = Time.formatDate(date)

    this.navigateToReviewFor(startDate, () => this.resetDatePicker())
  }

  pickDate () {
    this.pickedDate = true

    if (!this.disabled) {
      this.switchToDayPicking()
    }

    return false
  }

  releaseDate () {
    this.pickedDate = false

    return false
  }

  datePickerClasses () {
    return {
      'date-picker__container': true,
      'date-picker__container--active': this.pickedDate
    }
  }

  getStartDateMonth (startDate: string): number {
    const date = new Date(startDate)

    return date.getMonth()
  }

  getStartDateYear (startDate: string): number {
    const date = new Date(startDate)

    return date.getFullYear()
  }

  refreshStartDateLabel (startDate: string) {
    const date = new Date(startDate)
    const dayOfMonth = date.getDate()
    const daysOfWeek = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.']
    const months = [
      'Jan.',
      'Fév.',
      'Mar.',
      'Avr.',
      'Mai',
      'Juin',
      'Juil.',
      'Aou.',
      'Sep.',
      'Oct.',
      'Nov.',
      'Dec.'
    ]
    const dayOfWeek = daysOfWeek[date.getDay()]
    const month = months[date.getMonth()]
    const year = date.getFullYear()

    return `${dayOfWeek} ${dayOfMonth} ${month} ${year}`
  }

  visibleDaysInterval () {
    return {
      start: new Date(this.whenDidEarliestTweetsCurationHappen()),
      end: new Date(this.getMaxDate())
    }
  }
}
</script>

<style lang="scss" scoped>
@import './date-picker.scss';
</style>
