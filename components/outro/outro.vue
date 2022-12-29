<template>
  <div id="project" class="outro">
    <h2
      class="outro__title outro__iconography-introducing"
      :style="introducingIcon"
    >
      À propos
    </h2>

    <p class="outro__paragraph">
      Revue de presse s'appuie sur l'API de Twitter (<a href="https://developer.twitter.com/en/docs/twitter-api">Twitter Developer Platform</a>).
      Un classement s'appuyant sur les «retweets», offre chaque jour une visibilité sur 10 publications.
    </p>

    <h2
      class="outro__title outro__iconography-sharing"
      :style="sharingIcon"
    >
      @revue_2_presse
    </h2>

    <p class="outro__paragraph">
      Chaque jour, les posts les plus marquants émanants de journalistes féministes. Cette page est alimentée à partir d'une liste Twitter&nbsp;:
      <a href="https://twitter.com/i/lists/1094868073247637505">Journaliste et féministe</a>
      <br />

      <span
        class="outro__subscribe-to"
      ><!--
          --><a
        href="https://twitter.com/revue_2_presse"
      ><!--
            --><font-awesome-icon
        :icon="['fab', 'twitter']"
      />
              <span class="outro__subscription-label">Suivre&nbsp;@revue_2_presse</span><!--
        --></a><!--
      --></span>
    </p>

    <h2
      class="outro__title outro__iconography-funding"
      :style="fundingIcon"
    >
      Pro bono publico
    </h2>

    <p class="outro__paragraph">
      Depuis la naissance du projet en 2015 jusqu'en 2022,
      journaliste-feministe.revue-de-presse.org n'a reçu aucun financement extérieur.<br>
      De manière à rendre le projet plus soutenable,
      des pages de contribution ont été ouvertes :<br>
    </p>

    <ul class="outro__list">
      <li><a href="https://www.buymeacoffee.com/thierrymarianne">buymeacoffee.com</a></li>
      <li><a href="https://ko-fi.com/thierrymarianne/">ko-fi.com</a></li>
      <li><a href="https://liberapay.com/thierrymarianne/">liberapay.com</a></li>
      <li><a href="https://github.com/sponsors/thierrymarianne">github.com</a></li>
    </ul>

    <p class="outro__paragraph">
      Ce projet est porté avec 💙 par <a href="https://twitter.com/sylvaineg">@sylvaineg</a> et <a
      href="https://twitter.com/thierrymarianne"
    >@thierrymarianne</a>.
    </p>

    <div class="outro__copyright-footer">
      <div class="outro__copyright">
        &copy; {{ year }} · Design de <!--
      --><a
        class="outro__outer-link"
        href="https://twitter.com/CcelestinC"
      >@CcelestinC</a><!--
    -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins  } from 'nuxt-property-decorator'
import IntroducingIcon from '../../assets/icons/icon-introducing.svg'
import SharingIcon from '../../assets/icons/icon-sharing.svg'
import FundingIcon from '../../assets/icons/icon-funding.svg'
import DateMixin from "~/mixins/date";

@Component
class Outro extends mixins(DateMixin) {

    get year () {
      return this.now().getFullYear()
    }

    get fundingIcon () {
      const width = '18px'
      const height = '20px'

      return `--icon-funding-background: center / ${width} ${height} no-repeat url("${FundingIcon}");
          --icon-funding-height: ${height};
          --icon-funding-width: ${width}
        `
    }

    get introducingIcon () {
      const width = '22px'
      const height = '15px'

      return `--icon-introducing-background: center / ${width} ${height} no-repeat url("${IntroducingIcon}");
        --icon-introducing-height: ${height};
        --icon-introducing-width: ${width}
      `
    }

    get sharingIcon () {
      const width = '20px'
      const height = '18px'

      return `--icon-sharing-background: center / ${width} ${height} no-repeat url("${SharingIcon}");
        --icon-sharing-height: ${height};
        --icon-sharing-width: ${width}
      `
    }
}

export default Outro
</script>

<style lang="scss" scoped>
@import 'outro';
</style>
