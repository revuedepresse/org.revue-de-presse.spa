<template>
  <div class="logo">
    <div class="logo__container">
      <div class="logo__logo-container">
        <a href="/">
          <img
            class="logo__logo"
            alt="weaving-the-web.org logo"
            width="48"
            height="48"
            :src="logo"
          >
        </a>
      </div>
    </div>
    <h1 class="logo__title">
      Weaving the Web
    </h1>
  </div>
</template>

<script lang="ts">
import Logotype from '~/assets/weaving-the-web-logo.svg?data'
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class Logo extends Vue {
  get logo() {
    return Logotype
  }
}
</script>

<style lang="scss" scoped>
@import './logo.scss';
</style>
