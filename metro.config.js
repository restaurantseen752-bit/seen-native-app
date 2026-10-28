const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// إعدادات لضمان تجميع الأصول بشكل صحيح
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

module.exports = config;
