const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res, next) => {
    try {
      const { code, industry } = req.body;
      const result = await db.query('INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry', [code, industry]);
      return res.status(201).json({ industry: result.rows[0] });
    } catch (err) {
      return next(err);
    }
  });

router.get('/', async (req, res, next) => {
  try {
    const result = await db.query('SELECT i.code, i.industry, ARRAY_AGG(ci.company_code) AS companies FROM industries AS i JOIN company_industries AS ci ON i.code = ci.industry_code GROUP BY i.code, i.industry');
    return res.json({ industries: result.rows });
  } catch (err) {
    return next(err);
  }
});

router.post('/:code/companies', async (req, res, next) => {
    try {
      const { code } = req.params;
      const { company_code } = req.body;
      const result = await db.query('INSERT INTO company_industries (company_code, industry_code) VALUES ($1, $2) RETURNING company_code, industry_code', [company_code, code]);
      return res.status(201).json({ companyIndustry: result.rows[0] });
    } catch (err) {
      return next(err);
    }
  });
  
  module.exports = router;