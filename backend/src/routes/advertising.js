const express = require('express');
const { MINIMUM_AD_STAMPS, AD_ACTIVATION_OPTIONS } = require('../advertising');

const router = express.Router();

router.get('/activation-options', (req, res) => res.json({
  minimumStamps: MINIMUM_AD_STAMPS,
  options: AD_ACTIVATION_OPTIONS,
}));

module.exports = router;
