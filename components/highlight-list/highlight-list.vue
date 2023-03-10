<template>
  <ul
    class="list__items"
  >
    <li
      v-for="(curatedHighlight, index) in curatedHighlights"
      :key="curatedHighlight.tweetId"
      :data-key="curatedHighlight.tweetId"
      class="list__item"
    >
      <Status
        :status-at-first="formatStatus(curatedHighlight.tweet)"
        :show-media="showMedia"
        :is-baseline-view="isBaselineView"
        :is-intro="isIntro(index)"
        :ref-name="index"
      />
    </li>
  </ul>
</template>

<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import Intro from '../intro/intro.vue'
import LoadingSpinner from '../loading-spinner/loading-spinner.vue'
import LegalNotice from '../legal-notice/legal-notice.vue'
import Status from '../status/status.vue'
import Outro from '../outro/outro.vue'
import StatusFormatMixin, { RawStatus } from '~/mixins/status-format'
import DateMixin from '~/mixins/date'
import ApiMixin from '~/mixins/api'
import Logo from '~/assets/revue-des-potichats-logo.svg'

@Component({
  components: {
    Intro,
    LegalNotice,
    LoadingSpinner,
    Outro,
    Status
  }
})
export default class HighlightList extends mixins(ApiMixin, DateMixin, StatusFormatMixin) {
  @Prop({
    type: String,
    required: true
  })
    endDate: string = this.defaultDates().endDate

  @Prop({
    type: String,
    required: true
  })
    startDate: string = this.defaultDates().startDate

  @Prop({
    type: Boolean,
    default: true
  })
    showMedia!: boolean

  @Prop({
    type: Boolean,
    required: true,
    default: false
  })
    isShowingLegalNotice!: boolean

  @Prop({
    type: Boolean,
    required: true,
    default: false
  })
    isBaselineView!: boolean

  @Prop({
    type: Array,
    default: []
  })
    items!: Array<{ status: RawStatus }>

  get intro (): RawStatus {
    const text = 'Revue des PôtitsChats est un projet citoyen indépendant ' +
      'qui s\'adresse aux amoureux·ses des PôtitsAnimaux et en particulier les PôtitsChats.'

    const intro: RawStatus = {
      username: 'ratoulechat',
      avatarUrl: Logo,
      avatar_url: Logo,
      published_at: this.formatDate(this.now()),
      publishedAt: this.now(),
      statusId: '0',
      status_id: '0',
      text,
      url: '',
      isVisible: true,
      media: [],
      totalRetweet: 0,
      totalLike: 0,
      retweet_count: 0,
      favorite_count: 0,
      links: [],
      original_document: JSON.stringify({ user: { name: 'Revue des PôtitsChats' } })
    }

    return intro
  }

  get curatedHighlights (): Array<{tweet: RawStatus, tweetId: string}> {
    return this.highlights.map((h) => {
      const tweet = structuredClone(h.status)
      return {
        tweet,
        tweetId: tweet.statusId
      }
    })
  }

  get highlights () {
    const highlights = this.items

    let intro: Array<{ status: RawStatus }> = []
    if (this.$device.isDesktop) {
      intro = [{ status: this.intro }]
    }

    if (this.isShowingLegalNotice) {
      return intro
    }

    if (this.isBaselineView) {
      return intro.concat(highlights)
    } else {
      return highlights.slice(0, 3)
    }
  }

  head () {
    if (this.highlights.length > 1) {
      const whitespace = '\\s'
      const pattern = `https?://[^${whitespace}]+`

      let highlightIndex = 1
      if (this.$device.isMobile) {
        highlightIndex = 0
      }

      const description = this.highlights[highlightIndex].status.text
        .replaceAll(new RegExp(pattern, 'ig'), '')
        .replaceAll(new RegExp('[\r\n\\s]+', 'ig'), ' ')
      const title = `${description} - Revue des PôtitsChats du ${this.startDate}`

      return {
        title,
        meta: [
          { hid: 'description', name: 'description', content: description },
          {
            hid: 'og:url',
            property: 'og:url',
            content: `https://potitschats.revue-de-presse.org/${this.startDate}/`
          },
          {
            hid: 'og:title',
            property: 'og:title',
            content: title
          },
          {
            hid: 'og:description',
            property: 'og:description',
            content: description
          },
          {
            hid: 'twitter:description',
            property: 'twitter:description',
            content: description
          }
        ]
      }
    }
  }

  isIntro (key: number) {
    return this.$device.isDesktop && key === 0
  }
}
</script>

<style lang="scss" scoped>
@import './highlight-list.scss';
</style>
