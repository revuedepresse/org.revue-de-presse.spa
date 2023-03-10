<template>
  <div
    v-if="isBaselineView || !isIntro"
    :class="statusClasses()"
  >
    <div
      v-show="!isIntro"
      class="status__vanity-metrics"
    >
      <vanity-metric
        :count="retweet"
        :metric-type="webIntentTypes.retweet"
      />
      <vanity-metric
        :count="favorite"
        :metric-type="webIntentTypes.like"
      />
    </div>

    <div class="status__publication">
      <publisher
        :avatar-url="avatarUrl"
        :name="status.name"
        :username="status.username"
        :publication-url="status.url"
        :remove-twitter-logo="isIntro"
      />

      <div class="status__text-container">
        <p
          class="status__text"
          v-html="statusText"
        />
      </div>

      <publication-date
        v-if="!isIntro"
        :date="publicationDate"
        :publication-url="status.url"
      />
      <div
        v-show="!isIntro"
        class="status__web-intents"
      >
        <web-intent
          :status-id="status.statusId"
          :intent-type="webIntentTypes.reply"
        />
        <web-intent
          :status-id="status.statusId"
          :intent-type="webIntentTypes.retweet"
        />
        <web-intent
          :status-id="status.statusId"
          :intent-type="webIntentTypes.like"
        />
      </div>

      <div
        v-if="canShowMedia"
        class="status__row status__row--media"
      >
        <div class="status__media">
          <img
            v-for="(document, index) in status.media"
            :key="index"
            class="status__media-item"
            height="auto"
            :alt="getMediaTitle(document)"
            :title="getMediaTitle(document)"
            :src="getMediaDataUri(status)"
            :style="getMediaProperties()"
            :width="getMediaWidth()"
            @click="openMediaItem(document)"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, mixins } from 'nuxt-property-decorator'
import ApiMixin from '../../mixins/api'
import DateMixin from '../../mixins/date'
import StatusFormatMixin, { TweetUrl, FormattedStatus, Media } from '../../mixins/status-format'
import EventHub from '../../modules/event-hub'
import SharedState, { Errors, VisibleStatuses } from '../../modules/shared-state'
import Publisher from '../publisher/publisher.vue'
import PublicationDate from '../publication-date/publication-date.vue'
import VanityMetric from '../vanity-metric/vanity-metric.vue'
import WebIntent from '../web-intent/web-intent.vue'

@Component({
  components: { Publisher, PublicationDate, VanityMetric, WebIntent }
})
class Status extends mixins(ApiMixin, DateMixin, StatusFormatMixin) {
  @Prop({
    type: Object,
    required: true
  })
    statusAtFirst!: FormattedStatus

  @Prop({
    type: Boolean,
    default: true
  })
    showMedia!: boolean

  @Prop({
    type: Boolean,
    default: true
  })
    isBaselineView!: boolean

  @Prop({
    type: String,
    default: ''
  })
    fromAggregateType!: string

  @Prop({
    type: Boolean,
    default: false
  })
    isIntro!: boolean

  errorMessages: Errors = SharedState.errors
  logger = new SharedState.Logger()
  status: FormattedStatus = this.statusAtFirst
  visibleStatuses: VisibleStatuses = SharedState.state.visibleStatuses
  aggregateType: string = this.fromAggregateType

  get avatarUrl (): string {
    if (this.status.base64EncodedAvatar) {
      return this.status.base64EncodedAvatar
    }

    return this.status.avatarUrl
  }

  get webIntentTypes (): {[key: string]: string} {
    return {
      reply: 'reply',
      retweet: 'retweet',
      like: 'like'
    }
  }

  get canShowMedia () {
    return this.status.media && this.status.media.length > 0 && this.showMedia
  }

  get favorite () {
    return this.status.totalLike || 0
  }

  get urlWhichCanBeShared () {
    const basePath = `${window.location.protocol}//${window.location.host}`
    return `${basePath}/#/aggregate/${this.fromAggregateType}/${
        this.status.statusId
    }`
  }

  get retweet () {
    return this.status.totalRetweet || 0
  }

  get statusText () {
    if (
      typeof this.status === 'undefined' ||
        typeof this.status === 'string'
    ) {
      return ''
    }

    return this.formatStatusText(this.status)
  }

  get urls () {
    if (typeof this.status === 'undefined') {
      return ''
    }

    return {
      reply: `https://twitter.com/intent/tweet?in_reply_to=${
          this.status.statusId
      }`,
      retweet: `https://twitter.com/intent/retweet?tweet_id=${
          this.status.statusId
      }`,
      like: `https://twitter.com/intent/like?tweet_id=${this.status.statusId}`
    }
  }

  get publicationDate () {
    if (typeof this.status === 'undefined') {
      return ''
    }

    return this.setTimezone(new Date(this.status.publishedAt))
  }

  get memberTimelineUrl () {
    if (typeof this.status === 'undefined') {
      return ''
    }

    return `https://twitter.com/${this.status.username}`
  }

  get publisherStyle () {
    if (typeof this.status.avatarUrl === 'undefined') {
      return ''
    }
    const size = '48px'
    return `--avatar-url: center / ${size} no-repeat url("${this.status.avatarUrl}");
      --avatar-size: ${size};
      `
  }

  @Watch('statusAtFirst')
  onStatusAtFirstChange (_: FormattedStatus, newStatus: FormattedStatus) {
    this.status = newStatus
  }

  updated () {
    this.status = this.statusAtFirst
  }

  formatStatusText (status: FormattedStatus) {
    if (typeof status === 'undefined' || typeof status === 'string') {
      return ''
    }

    let urls: Array<TweetUrl> = []
    if (status.originalDocument.entities?.urls) {
      urls = status.originalDocument.entities.urls
    }

    let text = this.replaceHyperlinksWithAnchors(status.text, urls)
    text = this.replaceMentionsWithWithAnchors(text)

    return text.replace(/\s/g, ' ')
  }

  removeTrackingParams (subject: string) {
    return subject.replaceAll(new RegExp('[&?]utm[^=]*=[^&]*', 'gi'), '')
  }

  replaceHyperlinksWithAnchors (subject: string, urls: Array<TweetUrl>) {
    const whitespace = 's'
    const parens_start = '('
    const parens_end = ')'
    const comma = ','
    const not = '[^\\'
    const pattern = `(http(s?)://${not}${whitespace}\\${parens_start}\\${parens_end}${comma}]+)`

    return subject.replace(new RegExp(pattern, 'gi'), (matchingText: string) => {
      if (process.env.API_HOST !== undefined && matchingText.includes(process.env.API_HOST)) {
        return matchingText
      }

      urls.forEach((u: TweetUrl) => {
        const expandedUrl = this.removeTrackingParams(u.expanded_url)

        matchingText = matchingText.replaceAll(u.url,
          `<a class="status__text-external-link"
                 rel="noreferrer"
                 target="_blank" href="${expandedUrl}">${u.display_url}</a>`

        )

        return matchingText
      })

      const obfuscatedTweetUrl = `http(s?)://t.co${not}${whitespace}]+`
      if (matchingText.match(new RegExp(obfuscatedTweetUrl, 'gi')) !== null) {
        return ''
      }

      return matchingText
    })
  }

  replaceMentionsWithWithAnchors (subject: string) {
    const whitespace = 's'
    const startCharacterClass = '[^<>\\'
    const pattern = `(\\${whitespace}?)@(${startCharacterClass}${whitespace}]+)(\\${whitespace}?)`

    return subject.replace(
      new RegExp(pattern, 'gi'),
      (matchingSubstring: string, prefix: string, mention: string, suffix: string) => {
        if (matchingSubstring.includes('revue-de-presse')) {
          return matchingSubstring
        }

        return `${prefix}<a
                   class="status__text-external-link"
                   rel="noreferrer"
                   target="_blank"
                   href="https://twitter.com/${mention}">@${mention}</a>${suffix}`
      }
    )
  }

  statusClasses () {
    return { status: true, status__intro: this.isIntro }
  }

  getMediaProperties () {
    return {
      width: 'calc(100% - 1em)',
      'max-width': 'calc(100% - 1em)'
    }
  }

  getMediaDataUri (status: FormattedStatus) {
    return status.base64EncodedMedia
  }

  getMediaWidth (): Number {
    return 570
  }

  getMediaTitle (media: Media) {
    return media.title ? media.title : ''
  }

  openMediaItem (media: Media) {
    EventHub.$emit('modal_window.show_intended', { media })
  }
}

export default Status
</script>

<style lang='scss' scoped>
@import './status.scss';
</style>
