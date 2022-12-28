<template>
  <div
    v-show="isIntroVisible"
    ref="intro"
    class="intro"
  >
    <div class="intro__container">
      <div class="intro__content-container">
        <div class="intro__arrow-up" />
        <a
          class="intro__close-intro"
          @click="hideIntro"
        >+</a>
        <p class="intro__content">
          journaliste-feministe.revue-de-presse.org est un projet à but non lucratif
          qui s'adresse aux personnes appartenant aux métiers dits de «La Tech» ou en reconversion
          à la veille technique, méthodologique ainsi qu'à des questions telles que l'éthique,
          la santé mentale, l'inclusion et la diversité dans ces métiers.<br>
          <a
            :href="currentRoute + '#project'"
            class="intro__footer-anchor underline"
          >En savoir plus</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import logo from '../../assets/logo_100x100.png'

@Component
export default class Intro extends Vue {
  $refs!: {
    intro: {offsetHeight: number},
    [key: string]: any
  }

  @Prop({
    type: Boolean,
    default: true
  })
  isBaselineView!: boolean

  isIntroVisible: boolean = true;
  currentRoute: string = this.$router.currentRoute.path
  logo = logo

  height () {
    return this.$refs.intro.offsetHeight
  }

  hideIntro () {
    this.isIntroVisible = false
    this.$cookies.set('hideIntro', 1)
  }

  mounted () {
    if (this.$cookies.get('hideIntro') === 1 || !this.isBaselineView) {
      this.isIntroVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import './intro.scss';
</style>
