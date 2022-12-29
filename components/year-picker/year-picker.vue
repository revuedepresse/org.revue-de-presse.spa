<template>
  <div class="year-picker">
    <div class="year-picker__buttons">
      <div class="year-picker__navigation">
        <button
          :class="getPreviousItemClasses()"
          :style="previousItemIcon"
          @click="goToYearBeforePickedDate"
        />
        <button
          :class="getNextItemClasses()"
          :style="nextItemIcon"
          @click="goToYearFollowingPickedDate"
        />
      </div>
    </div>
    <ScrollableList
      class="year-picker__scrollable-list"
      :items="acceptedYears"
      :selected="year"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, mixins, namespace } from 'nuxt-property-decorator'
import ScrollableList from '../scrollable-list/scrollable-list.vue'
import previousItemIcon from '~/assets/icons/icon-previous-item.png'
import nextItemIcon from '~/assets/icons/icon-next-item.png'
import DateMixin from '~/mixins/date'
import NavMixin from '~/mixins/nav'
import Time from '~/modules/time'

const DatePickerStore = namespace('date-picker')

@Component({
  components: { ScrollableList }
})
class YearPicker extends mixins(DateMixin, NavMixin) {
  @Prop({
    type: Number,
    required: true
  })
  year!: number

  @Prop({
    type: Number,
    required: true
  })
  startingYear!: number

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

  @DatePickerStore.Mutation
  public resetDatePicker!: () => void

  get acceptedYears () {
    const today = this.now()
    const years = new Array(today.getFullYear() - this.earliestTweetsCurationYear());
    const pickedYear = this.year;

    return [{
      index: 0,
      label: this.earliestTweetsCurationYear(),
      isSelected: pickedYear === this.earliestTweetsCurationYear(),
      onClick: () => {}
    }].concat(
      years
        .fill(this.earliestTweetsCurationYear() + 1)
        .map((year, inc) => {
          return {
            index: inc + 1,
            label: year + inc,
            isSelected: pickedYear === year + inc,
            onClick: () => {}
          }
        })
    ).map((acceptedYear) => {
      acceptedYear.onClick = () => {
        if (acceptedYear.label === this.earliestTweetsCurationYear()) {
          this.pickDate(this.setTimezone(new Date(`${acceptedYear.label}-${this.earliestTweetsCurationMonth()}-01`)))

          return
        }

        this.pickDate(this.setTimezone(new Date(`${acceptedYear.label}-01-01`)))
      }
      return acceptedYear
    })
  }

  get previousItemIcon () {
    const widthOrHeight = '32px'

    return `
        --icon-previous-item-background: center / ${widthOrHeight} no-repeat url("${previousItemIcon}");
        --icon-previous-item-height: ${widthOrHeight};
        --icon-previous-item-width: ${widthOrHeight}
      `
  }

  get nextItemIcon () {
    const widthOrHeight = '32px'

    return `
        --icon-next-item-background: center / ${widthOrHeight} no-repeat url("${nextItemIcon}");
        --icon-next-item-height: ${widthOrHeight};
        --icon-next-item-width: ${widthOrHeight}
      `
  }

  getNextItemClasses () {
    return {
      'year-picker__next-item': true,
      'year-picker__next-item--disabled': !this.isNextItemAvailable
    }
  }

  getPreviousItemClasses () {
    return {
      'year-picker__previous-item': true,
      'year-picker__previous-item--disabled': !this.isPreviousItemAvailable
    }
  }

  goToYearBeforePickedDate (): boolean {
    if (!this.isPreviousItemAvailable) {
      return false
    }

    if (this.year === this.earliestTweetsCurationYear() + 1) {
      this.pickDate(this.setTimezone(new Date(`${this.year - 1}-${this.earliestTweetsCurationMonth()}-01`)))
    }  else {
      this.pickDate(this.setTimezone(new Date(`${this.year - 1}-01-01`)))
    }

    return false
  }

  goToYearFollowingPickedDate () {
    if (!this.isNextItemAvailable) {
      return false
    }

    this.pickDate(this.setTimezone(new Date(`${this.year + 1}-01-01`)))

    return false
  }

  pickDate (date: Date) {
    this.navigateToReviewFor(Time.formatDate(date), () => this.resetDatePicker())
  }
}

export default YearPicker
</script>

<style lang="scss" scoped>
@import './year-picker.scss';
</style>
