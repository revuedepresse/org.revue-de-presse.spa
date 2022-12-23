<template>
  <div class="list-picker">
    <div
      class="list-picker__title"
      :style="listIcon"
    >
      <label
        class="list-picker__label"
        v-text="listLabel"
      ></label>
    </div>
    <ScrollableList
      :items="publisherLists"
      :selected="list"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import listIcon from '~/assets/icons/icon-pick-list.svg'

@Component
export default class ListPicker extends Vue {
  @Prop({
    type: Array,
    required: true,
    default: []
  })
  lists!: Array<{list_id: string, foreign_list_id: string, list_name: string}>

  list: string = ''

  listLabel: string = 'Listes'

  created() {
    if (this.$route.name === 'list-review') {
      this.list = this.$route.params.listId
    }
  }

  get listIcon () {
    const widthOrHeight = '19px'

    return `
      --icon-list-background: center / ${widthOrHeight} no-repeat url("${listIcon}");
      --icon-list-height: ${widthOrHeight};
      --icon-list-width: ${widthOrHeight}
    `
  }

  get publisherLists() {
    return this.lists.map(l => {
      return {
        label: l.list_name,
        index: l.list_id,
        isSelected: this.list === l.list_id,
        isDisabled: false,
        onClick: () => {
          this.pickList(l.list_id)
        }
      }
    })
  }

  pickList (listId: string) {
    this.list = listId
    this.$router.push({
      name: 'list-review',
      params: { startDate: this.$route.params.startDate, listId }
    })
  }

}
</script>

<style lang="scss" scoped>
@import './list-picker.scss';
</style>
