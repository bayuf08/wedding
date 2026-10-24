<template><div class="navigation-curtain" aria-hidden="true"><i v-for="index in 10" :key="index" data-menu-curtain /></div></template>
<style scoped>
.navigation-curtain { position: fixed; inset: 0; z-index: 0; display: flex; pointer-events: none; overflow: hidden; }
.navigation-curtain i { flex: 1 1 10%; height: 100%; margin-right: -.5px; background: #f0f0f0; transform-origin: 50% 0; transform: translateY(100%) scaleY(0); }
@media (max-width: 767px) { .navigation-curtain i { flex-basis: 20%; } .navigation-curtain i:nth-child(n+6) { display: none; } }
</style>
