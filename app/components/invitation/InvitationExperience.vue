<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { InvitationViewModel } from '../../types/invitation'
import type { ImageAsset } from '../../types/claire'
import { mediaManifest } from '../../data/media.manifest'
import { useInvitationExperience } from '../../composables/useInvitationExperience'
import { useMotionPreference } from '../../composables/useMotionPreference'
import { useScrollScenes } from '../../composables/useScrollScenes'
import { clamp01 } from '../../utils/motion-math'
import EventChangeNotice from './EventChangeNotice.vue'
import InvitationLoader from './InvitationLoader.vue'
import OpeningCover from './OpeningCover.vue'
import InvitationControls from './InvitationControls.vue'
import OpenedHero from './scenes/OpenedHero.vue'
import QuotePassage from './scenes/QuotePassage.vue'
import ProfilesSection from './scenes/ProfilesSection.vue'
import StoryIntroduction from './scenes/StoryIntroduction.vue'
import StoryChapters from './scenes/StoryChapters.vue'
import CelebrationSection from './scenes/CelebrationSection.vue'
import EventDetails from './scenes/EventDetails.vue'
import GiftIntroduction from './scenes/GiftIntroduction.vue'
import RsvpSection from './scenes/RsvpSection.vue'
import WishesSection from './scenes/WishesSection.vue'
import VideoFeature from './scenes/VideoFeature.vue'
import GallerySection from './scenes/GallerySection.vue'
import ClosingSection from './scenes/ClosingSection.vue'
import NavigationDialog from './overlays/NavigationDialog.vue'
import GiftDialog from './overlays/GiftDialog.vue'
import GalleryLightbox from './overlays/GalleryLightbox.vue'

const props = withDefaults(defineProps<{ invitation: InvitationViewModel; guestName?: string }>(), { guestName: 'Guest Name' })
const content = computed(() => props.invitation.content)
const image = (id: string): ImageAsset => {
  const result = mediaManifest[id]
  if (!result) throw new Error(`Missing Claire image: ${id}`)
  return result
}
const galleryImages = computed(() => content.value.gallery.imageIds.map(image))
const quoteImages = computed(() => content.value.quote.imageIds.map(image) as [ImageAsset, ImageAsset, ImageAsset])
const profileImages = computed(() => content.value.profiles.map(profile => image(profile.imageId)) as [ImageAsset, ImageAsset])
const storyImages = computed(() => content.value.story.imageIds.map(image))
const experience = useInvitationExperience(content.value.gallery.imageIds.length)
const { opening, progress, overlay, openInvitation, showNavigation, showGift, showImage, closeOverlay, navigateTo } = experience
const { systemReduced, manualPaused, motionAllowed } = useMotionPreference()
const sceneMotionAllowed = computed(() => motionAllowed.value && opening.value === 'open' && overlay.value.kind === 'none')
const root = ref<HTMLElement | null>(null)
const enhanced = ref(false)
onMounted(() => { enhanced.value = true })
const darkening = ref(0)
useScrollScenes(root, sceneMotionAllowed, scroll => { darkening.value = sceneMotionAllowed.value ? clamp01(scroll / 300) : 0 })
function changePhoto(index: number) { if (overlay.value.kind === 'lightbox') overlay.value = { kind: 'lightbox', index } }
</script>

<template>
  <div ref="root" class="invitation-experience" :data-enhanced="enhanced" :data-motion-paused="manualPaused || systemReduced" :data-motion-ready="sceneMotionAllowed">
    <main id="main" :inert="enhanced && opening !== 'open' ? true : undefined">
      <OpenedHero :hero="content.hero" :poster="image(content.hero.posterId)" :darkening="darkening" :media-paused="!sceneMotionAllowed" />
      <EventChangeNotice :lifecycle="invitation.lifecycle" />
      <QuotePassage :quote="content.quote" :images="quoteImages" />
      <ProfilesSection :profiles="content.profiles" :images="profileImages" />
      <StoryIntroduction :story="content.story" :images="storyImages" :paused="!sceneMotionAllowed" />
      <StoryChapters :chapters="content.story.chapters" />
      <CelebrationSection :celebration="content.celebration" :image="image(content.celebration.imageId)" />
      <EventDetails :events="content.events" />
      <GiftIntroduction :gift="content.gift" :image="image(content.gift.imageId)" @open="showGift" />
      <RsvpSection :rsvp="content.rsvp" :image="image(content.rsvp.imageId)" :guest-name="guestName" />
      <WishesSection :wishes="content.rsvp.wishes" :page-size="content.rsvp.pageSize" />
      <VideoFeature :video="content.video" :poster="image(content.video.posterId)" />
      <GallerySection :heading="content.gallery.heading" :images="galleryImages" @open="showImage" />
      <ClosingSection :closing="content.closing" :image="image(content.closing.imageId)" />
    </main>
    <InvitationControls v-if="opening === 'open'" :paused="manualPaused || systemReduced" :media-available="Boolean(content.hero.videoSrc || content.hero.audioSrc)" @menu="showNavigation" @pause="manualPaused = !manualPaused" />
    <OpeningCover v-if="opening !== 'open'" :cover="content.cover" :image="image(content.cover.imageId)" :guest-name="guestName" :opening="opening === 'opening'" @open="openInvitation" />
    <InvitationLoader v-if="opening === 'loading'" :image="image('loader')" :progress="progress" />
    <NavigationDialog :open="overlay.kind === 'navigation'" :image="image(content.navigationImageId)" @close="closeOverlay" @navigate="navigateTo" />
    <GiftDialog :open="overlay.kind === 'gift'" :banks="content.gift.banks" :guest-name="guestName" @close="closeOverlay" />
    <GalleryLightbox :open="overlay.kind === 'lightbox'" :images="galleryImages" :index="overlay.kind === 'lightbox' ? overlay.index : 0" @close="closeOverlay" @change="changePhoto" />
  </div>
</template>
