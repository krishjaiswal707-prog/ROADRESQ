const express = require('express');
const router = express.Router();
const { getCityConfig } = require('../../config/cities');

// 1. Get hospitals for a specific city
router.get('/:cityId?', (req, res) => {
  const cityId = req.params.cityId || req.query.cityId || 'chennai';
  const city = getCityConfig(cityId);
  res.json({
    cityId: city.cityId,
    cityName: city.cityName,
    count: city.hospitals.length,
    hospitals: city.hospitals
  });
});

module.exports = router;

