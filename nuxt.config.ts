// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/sitemap'],
  
  app: {
    head: {
      htmlAttrs: {
        lang: 'ja'
      },
      title: 'EFT Item Tracker - Escape from Tarkov アイテム管理ツール',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { 
          name: 'description', 
          content: 'Escape from Tarkov (EFT) のアイテム、タスク、ハイドアウトを効率的に管理。必要アイテムの追跡、タスク進捗の確認、ハイドアウトのアップグレード計画を簡単に。' 
        },
        { name: 'keywords', content: 'Escape from Tarkov, EFT, タルコフ, アイテム管理, タスク管理, ハイドアウト, トラッカー, 日本語' },
        { name: 'author', content: 'EFT Item Tracker' },
        
        // Open Graph
        { property: 'og:title', content: 'EFT Item Tracker - Escape from Tarkov アイテム管理ツール' },
        { property: 'og:description', content: 'Escape from Tarkov のアイテム、タスク、ハイドアウトを効率的に管理するツール' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'ja_JP' },
        
        // Twitter Card
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: 'EFT Item Tracker' },
        { name: 'twitter:description', content: 'Escape from Tarkov のアイテム管理ツール' }
      ],
      link: [
        { rel: 'canonical', href: 'https://eft-item-tracker-441d2.web.app' }
      ],
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            'name': 'EFT Item Tracker',
            'description': 'Escape from Tarkov のアイテム、タスク、ハイドアウトを管理するウェブアプリケーション',
            'applicationCategory': 'GameApplication',
            'operatingSystem': 'Web',
            'offers': {
              '@type': 'Offer',
              'price': '0',
              'priceCurrency': 'JPY'
            }
          })
        }
      ]
    }
  },
  
  site: {
    url: 'https://eft-item-tracker-441d2.web.app',
  },
  
  sitemap: {
    xsl: false,
    defaults: {
      changefreq: 'weekly',
      priority: 0.8
    }
  },
  
  runtimeConfig: {
    public: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID
    }
  }
})
