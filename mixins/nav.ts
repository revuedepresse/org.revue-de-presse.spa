import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class NavMixin extends Vue {
  navigateToReviewFor(date: string, postNavigation?: () => void) {
    if (this.$route.name === 'list-review') {
      this.$router.push({
        name: 'list-review',
        params: { startDate: date, listId: this.$route.params.listId }
      })

      this.guardAgainstNonMobileDevice(postNavigation)

      return
    }

    this.$router.push({
      name: 'review',
      params: { startDate: date }
    })

    this.guardAgainstNonMobileDevice(postNavigation)
  }

  guardAgainstNonMobileDevice(cb?: () => void) {
    if (!this.$device.isMobile) {
      return
    }

    if (typeof cb === 'function') {
      cb();
    }
  }
}
