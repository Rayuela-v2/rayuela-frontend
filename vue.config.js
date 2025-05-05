module.exports = {
  pwa: {
    name: 'Rayuela',
    themeColor: '#4DBA87',
    msTileColor: '#000000',
    manifestOptions: {
      short_name: 'App',
      start_url: '.',
      display: 'standalone',
      background_color: '#FFFFFF'
    },
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true
    }
  }
};