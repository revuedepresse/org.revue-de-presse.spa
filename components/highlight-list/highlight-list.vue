<template>
  <div :class="highlightsClasses">
    <link rel="preconnect" :href="getApiHost">

    <AppHeader
      ref="header"
      :is-baseline-view="isBaselineView"
      :picked-date="startDate"
    />

    <div
      class="highlight-list__content">
      <div
        v-if="isBaselineView"
        class="highlight-list__navigation">

<!--        <ListPicker :lists="publishersLists" />-->

        <DatePicker
          v-if="startDate"
          :start-date="startDate"
        />
        <Outro/>
      </div>

      <div
        ref="highlights"
        :class="containerClass"
      >

        <ul
          class="list__items">
          <li
            v-for="(highlight, index) in highlights"
            :key="highlight.statusId"
            :data-key="highlight.statusId"
            class="list__item"
          >
            <Status
              :status-at-first="formatStatus(highlight.status)"
              :show-media="showMedia"
              :is-baseline-view="isBaselineView"
              :is-intro="isIntro(index)"
              :ref-name="index"
            />
          </li>
        </ul>

        <LoadingSpinner
          v-if="isLoadingSpinnerVisible"
          :message="errorMessage"
          :show-error-message="showErrorMessage"
          :show-loading-spinner="showLoadingSpinner"
        />

      </div>

    </div>

  </div>

</template>

<script lang="ts">
import {Component, Prop, Watch, mixins} from 'nuxt-property-decorator'
import Config from '../../config'
import EventHub from '../../modules/event-hub'
import SharedState from '../../modules/shared-state'
import AppHeader, {HeightAware} from '../app-header/app-header.vue'
import Intro from '../intro/intro.vue'
import DatePicker from '../date-picker/date-picker.vue'
import ListPicker from '../list-picker/list-picker.vue'
import LoadingSpinner from '../loading-spinner/loading-spinner.vue'
import Status from '../status/status.vue'
import Outro from '../outro/outro.vue'
import StatusFormatMixin, {RawStatus} from '~/mixins/status-format'
import DateMixin from '~/mixins/date'
import ApiMixin from '~/mixins/api'
import NavMixin from '~/mixins/nav'
import Logo from '~/assets/logo.svg'

const RETWEETS_EXCLUDED = '0'

type Params = {
  endDate?: string,
  startDate?: string,
  pageIndex?: number,
  pageSize?: number,
  includeRetweets?: number
  selectedAggregates?: number[],
  [key: string]: any
}

type RequestOptionsHeaders = Headers

type RequestOptions = {
  headers: RequestOptionsHeaders,
  params: Params
}

@Component({
  components: {
    AppHeader,
    DatePicker,
    Intro,
    ListPicker,
    LoadingSpinner,
    Outro,
    Status
  }
})
export default class HighlightList extends mixins(ApiMixin, NavMixin, DateMixin, StatusFormatMixin) {
  @Prop({
    type: Boolean,
    default: true
  })
  showMedia!: boolean

  includeRetweets: string = RETWEETS_EXCLUDED
  items: Array<{ status: RawStatus }> = []
  publishersLists: Array<{list_id: string, foreign_list_id: string, list_name: string}> = []
  logger = new SharedState.Logger()
  minDate = this.whenDidEarliestTweetsCurationHappen()
  maxDate = this.getMaxDate()
  selectedAggregates: number[] = []
  pageIndex: number = 1
  pageSize: number = 10
  totalPages: number | null = null
  endDate: string = this.defaultDates().endDate
  startDate: string = this.defaultDates().startDate

  $refs!: {
    header: HeightAware,
    highlights: {
      offsetHeight: number
    },
    [key: string]: any
  }

  async fetch() {
    const action = this.getHighlightsAction()
    const route = this.getHighlightsRoute()
    const requestOptions = this.getRequestOptions()

    const url = new URL(route)
    Object.keys(requestOptions.params).map((key: string) => {
      let param: string | null = requestOptions.params[key]
      if (param == null) {
        param = ''
      }

      return url.searchParams.set(key, param)
    })

    const response = await fetch(
      url.toString(),
      {
        method: action.method,
        headers: requestOptions.headers
      }
    )
      .then(res => res.json())
      .catch((_e) => {
        this.logger.error(
          // e.message, 'highlight-list', e
        )
      })

    this.items = response.statuses
    this.publishersLists = response.aggregates
  }

  get containerClass() {
    const filledContainerClass = 'highlight-list__container highlight-list__container--filled'
    const nonEmptyList = this.$nuxt.isOnline && this.highlights.length > 0

    if (nonEmptyList || this.$fetchState.pending) {
      return filledContainerClass
    }

    return 'highlight-list__container'
  }

  get errorMessage() {
    return `Il semblerait qu'il n'y ait pas de contenu disponible pour cette date.`
  }

  get getApiHost() {
    return Config.getSchemeAndHost()
  }

  get canIdentifyRetweets() {
    return this.setTimezone(new Date(this.startDate)) >= this.setTimezone(new Date('2018-12-09'))
  }

  get canFilterByRetweet() {
    return false
  }

  get highlights() {
    let highlights = this.items

    if (this.isBaselineView) {
      if (this.$device.isDesktop) {
        return [{status: this.intro}].concat(highlights)
      }
    } else {
      highlights = highlights.slice(0, 3)
    }

    return highlights
  }

  get highlightsClasses() {
    return {
      'highlight-list': true,
      'highlight-list--naked': !this.isBaselineView,
      list: true
    }
  }

  get highlightListOffsetHeight() {
    if (!this.$refs.highlights) {
      return 0
    }

    return this.$refs.highlights.offsetHeight
  }

  get includedRetweetsLabel() {
    return 'included'
  }

  get isBaselineView() {
    if (this.$route === undefined) {
      return true
    }

    const paramNames = Object.keys(this.$route.query);
    const isBaselineViewActive = paramNames.find((p) => p === 'naked') === undefined

    return this.$device.isDesktop || isBaselineViewActive
  }

  get excludedRetweetsLabel() {
    return 'excluded'
  }

  get intro(): RawStatus {
    const anchorText = 'Journaliste et féministe'
    const url = 'https://twitter.com/i/lists/1094868073247637505'
    const link = '<a class="status__text-external-link" rel="noreferrer" target="_blank" href="' + `${url}` +'">' + url + '</a>'

    const text = 'Chaque jour, les posts les plus marquants émanants de journalistes féministes. Cette page est alimentée à partir d\'une liste Twitter&nbsp;: ' +
      `${link}` + '.'

    const intro: RawStatus = {
      username: 'revue_2_presse',
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
      original_document: JSON.stringify({
        user: {name: anchorText},
        entities: {urls: [{
          'expanded_url': url,
          'display_url': anchorText,
          'url': url,
        }]}
      })
    }

    return intro
  }

  get showEndDate() {
    return this.$route.name !== 'highlights'
  }

  get showErrorMessage(): boolean {
    return this.$fetchState.error !== null || (this.items.length === 0 && this.publishersLists.length > 0)
  }

  get showLoadingSpinner(): boolean {
    return this.$fetchState.pending === true
  }

  get isLoadingSpinnerVisible() {
    if (this.isBaselineView && this.$device.isDesktop) {
      return this.highlights.length === 1
    }

    return this.highlights.length === 0
  }

  @Watch('startDate')
  onStartDateChange() {
    this.updateHighlights()
  }

  @Watch('endDate')
  onEndDateChange() {
    this.updateHighlights()
  }

  @Watch('includeRetweets')
  onIncludeRetweetsChange() {
    this.updateHighlights()
  }

  destroyed() {
    EventHub.$off('highlight_list.reload_intended')
  }

  created() {
    EventHub.$off('highlight_list.reload_intended')
    EventHub.$on('highlight_list.reload_intended', this.fetchHighlights)

    this.fetchHighlights()
  }

  defaultDates() {
    let {startDate, endDate} = this.$route.params

    if (startDate === '1970-01-01') {
      startDate = this.whenDidEarliestTweetsCurationHappen()
    }

    if (endDate === '1970-01-01') {
      endDate = this.getMaxDate()
    }

    return {
      startDate,
      endDate
    }
  }

  fetchHighlights() {
    this.$fetch()
  }

  getRequestOptions(params: Params = {}) {
    const authenticationToken = localStorage.getItem('x-auth-token')

    const requestHeaders: Headers = new Headers()
    requestHeaders.set('x-auth-token', authenticationToken || '')

    let publisherListId = ''

    if (this.$route.name === 'list-review') {
      publisherListId = this.$route.params.listId
    }

    const requestOptions: RequestOptions = {
      headers: requestHeaders,
      params: {
        includeRetweets: 1,
        startDate: this.startDate,
        endDate: this.startDate,
        publisherListId
      }
    }

    if (!this.showEndDate) {
      requestOptions.params.endDate = this.startDate
    }

    if (params.pageIndex) {
      requestOptions.params.pageIndex = params.pageIndex
    }

    if (this.pageSize > 0) {
      requestOptions.params.pageSize = this.pageSize
    }

    if (this.includeRetweets === RETWEETS_EXCLUDED) {
      requestOptions.params.includeRetweets = 0
    }

    if (this.selectedAggregates.length > 0) {
      requestOptions.params.selectedAggregates = this.selectedAggregates
    }

    return requestOptions
  }

  getHighlightsAction() {
    return this.routes.actions.fetchHighlights
  }

  getHighlightsRoute() {
    const action = this.getHighlightsAction()
    return `${Config.getSchemeAndHost()}${action.route}`
  }

  highlightListHeight() {
    const highlights = this.$refs.highlights

    if (!this.$refs.highlights) {
      return '0'
    }

    return `${highlights.offsetHeight}`
  }

  introHeight() {
    let height = 0
    if (this.$refs.header) {
      height = this.$refs.header.height()
    }

    return height
  }

  isIntro(key: number) {
    return this.$device.isDesktop && key === 0
  }

  updateHighlights() {
    this.items = []

    this.navigateToReviewFor(this.startDate);
  }
}
</script>

<style lang="scss" scoped>
@import './highlight-list.scss';
</style>
