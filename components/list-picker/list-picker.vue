<template>
  <div class="list-picker">
    <div class="list-picker__pickers">
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import listIcon from '~/assets/icons/icon-pick-list.svg'

@Component
export default class ListPicker extends Vue {
  @Prop({
    type: Object,
    required: true
  })
  lists!: object

  pickedList: boolean = false

  get listIcon () {
    const widthOrHeight = '19px'

    return `
      --icon-calendar-background: center / ${widthOrHeight} no-repeat url("${listIcon}");
      --icon-calendar-height: ${widthOrHeight};
      --icon-calendar-width: ${widthOrHeight}
    `
  }
}
</script>

<style lang="scss" scoped>
@import './list-picker.scss';
</style>
