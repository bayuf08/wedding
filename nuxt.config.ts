import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: { invitationAdminApiBase: '' },
  css: ['~/assets/css/main.css'],
  routeRules: {
    '/': { redirect: '/invite/demo' },
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})
