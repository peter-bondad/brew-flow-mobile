export default {
  expo: {
    name: 'brewflow-mobile',
    slug: 'brewflow-mobile',
    version: '1.0.0',
    scheme: 'brewflow',
    extra: {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    },
  },
};
