<template>
  <div class="logo">
    <div class="logo__container">
      <div class="logo__logo-container">
        <a href="/">
          <img
            class="logo__logo"
            alt="Revue des PôtitsChats logo"
            width="48"
            height="48"
            :src="logo"
          >
        </a>
      </div>
    </div>
    <h1 class="logo__title">
      Revue des PôtitsChats
    </h1>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import Logotype from '~/assets/revue-des-potichats-logo.svg?data'

@Component
export default class Logo extends Vue {
  get logo () {
    return Logotype
  }
}
</script>

<style lang="scss" scoped>
@import './logo.scss';
</style>
