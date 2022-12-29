<template>
  <div class="month-picker">
    <div
      class="month-picker__buttons"
      :style="pickItemIcon"
    >
      <div
        class="month-picker__container"
        @click="switchToYearPicking"
      >
        <button
          class="month-picker__button"
          @click="switchToYearPicking"
          v-text="yearLabel"
        />
      </div>

      <div class="month-picker__navigation">
        <button
          :class="getPreviousItemClasses()"
          :style="previousItemIcon"
          @click="goToMonthBeforePickedDate"
        />
        <button
          :class="getNextItemClasses()"
          :style="nextItemIcon"
          @click="goToMonthFollowingPickedDate"
        />
      </div>
    </div>
    <ScrollableList
      :items="months"
      :selected="month"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, mixins, namespace } from 'nuxt-property-decorator'
import ScrollableList from '../scrollable-list/scrollable-list.vue'
import PickItemIcon from '~/assets/icons/icon-pick-item.svg'
import PreviousItemIcon from '~/assets/icons/icon-previous-item.svg'
import PreviousItemActiveIcon from '~/assets/icons/icon-previous-item-active.svg'
import PreviousItemDisabledIcon from '~/assets/icons/icon-previous-item-disabled.svg'
import PreviousItemHoverIcon from '~/assets/icons/icon-previous-item-hover.svg'
import NextItemIcon from '~/assets/icons/icon-next-item.svg'
import NextItemActiveIcon from '~/assets/icons/icon-next-item-active.svg'
import NextItemDisabledIcon from '~/assets/icons/icon-next-item-disabled.svg'
import NextItemHoverIcon from '~/assets/icons/icon-next-item-hover.svg'
import DateMixin from '~/mixins/date'
import NavMixin from '~/mixins/nav'
import Time from '~/modules/time'

type DateInterval = {
  start: Date,
  end: Date
}

const DatePickerStore = namespace('date-picker')

@Component({
  components: { ScrollableList }
})
class MonthPicker extends mixins(DateMixin, NavMixin) {
  @Prop({
    type: Boolean,
    required: true
  })
  isNextItemAvailable!: boolean

  @Prop({
    type: Boolean,
    required: true
  })
  isPreviousItemAvailable!: boolean

  @Prop({
    type: Number,
    required: true
  })
  month!: number

  @Prop({
    type: Object,
    required: true
  })
  visibleDaysInterval!: DateInterval

  @Prop({
    type: Number,
    required: true
  })
  year!: number

  @DatePickerStore.Mutation
  public pickYear!: () => void

  @DatePickerStore.Mutation
  public resetDatePicker!: () => void

  get yearLabel () {
    return `${this.year}`
  }

  get months () {
    const daysInterval = this.visibleDaysInterval;
    const pickedYear = this.year;
    const pickedMonth = this.month;

    return this.getMonths
      .map((m, monthIndex) => {
        const isEnabled = (
          pickedYear >= daysInterval.start.getFullYear() &&
              pickedYear < daysInterval.end.getFullYear()
        ) || (
          pickedYear === daysInterval.end.getFullYear() &&
              monthIndex <= daysInterval.end.getMonth()
        )

        let isMonthEnabled = monthIndex < daysInterval.end.getMonth();
        if (pickedYear === daysInterval.start.getFullYear()) {
          isMonthEnabled = monthIndex + 1 >= this.earliestTweetsCurationMonth()
        } else if (pickedYear !== daysInterval.end.getFullYear()) {
          isMonthEnabled = true
        }

        const isDisabled = !isEnabled || !isMonthEnabled;

        return {
          index: monthIndex,
          label: m,
          isSelected: pickedMonth === monthIndex,
          isDisabled,
          onClick: () => {
            if (isDisabled) {
              return
            }

            this.pickDate(this.setTimezone(new Date(`${pickedYear}-${monthIndex + 1}-01`)))
          }
        }
      })
  }

  get pickItemIcon () {
    const widthOrHeight = '20px'

    return `
      --icon-pick-item-background: center / ${widthOrHeight} no-repeat url("${PickItemIcon}");
      --icon-pick-item-height: ${widthOrHeight};
      --icon-pick-item-width: ${widthOrHeight}
    `
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

  get visibleDaysStart () {
    return this.visibleDaysInterval.start
  }

  get visibleDaysEnd () {
    return this.visibleDaysInterval.end
  }

  getNextItemClasses () {
    return {
      'month-picker__next-item': true,
      'month-picker__next-item--disabled': !this.isNextItemAvailable
    }
  }

  getPreviousItemClasses () {
    return {
      'month-picker__previous-item': true,
      'month-picker__previous-item--disabled': !this.isPreviousItemAvailable
    }
  }

  goToMonthBeforePickedDate () {
    if (!this.isPreviousItemAvailable) {
      return false
    }

    let year = this.year
    let month = this.month

    if (this.month === 0) {
      year = this.year - 1
      month = 12
    }

    let date = this.setTimezone(new Date(`${year}-${month}-01`))
    if (month < 10) {
      date = this.setTimezone(new Date(`${year}-0${month}-01`))
    }

    this.pickDate(date)

    return false
  }

  goToMonthFollowingPickedDate () {
    if (!this.isNextItemAvailable) {
      return false
    }

    let year: number = this.year
    let month: number = this.month

    if (this.month === 11) {
      year = this.year + 1
      month = 1
    } else {
      month = month + 2
    }

    let date = this.setTimezone(new Date(`${year}-${month}-01`))
    if (month < 10) {
      date = this.setTimezone(new Date(`${year}-0${month}-01`))
    }

    this.pickDate(date)

    return false
  }

  pickDate (date: Date) {
    this.navigateToReviewFor(Time.formatDate(date), () => this.resetDatePicker())
  }

  switchToYearPicking (): void {
    this.pickYear()
  }
}

export { DateInterval }

export default MonthPicker
</script>

<style lang="scss" scoped>
@import './month-picker.scss';
</style>
