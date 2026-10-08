const MINIMUM_AD_STAMPS = 5;

const AD_ACTIVATION_OPTIONS = Object.freeze([
  Object.freeze({ stamps: MINIMUM_AD_STAMPS, days: 15 }),
  Object.freeze({ stamps: MINIMUM_AD_STAMPS, days: 10 }),
  Object.freeze({ stamps: MINIMUM_AD_STAMPS, days: 5 }),
]);

module.exports = { MINIMUM_AD_STAMPS, AD_ACTIVATION_OPTIONS };
