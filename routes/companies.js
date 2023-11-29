const express = require('express');
const router = new express.Router();
const db = require('../db');
const ExpressError = require('../expressError');
const slugify = require('slugify');

// GET /companies


router.get('/', async (req, res, next) => {
  try {
    const result = await db.query('SELECT code, name FROM companies');
    return res.json({ companies: result.rows });
  } catch (err) {
    return next(err);
  }
});

router.get('/:code', async (req, res, next) => {
  const companyCode = req.params.code;

  // Validate the input
  if (!companyCode) {
    return res.status(400).send('Invalid company code');
  }

  try {
    
    const [companyResult, industriesResult] = await Promise.all([
      db.query('SELECT code, name, description FROM companies WHERE code = $1', [companyCode]),
      db.query('SELECT i.code, i.industry FROM industries AS i JOIN company_industries AS ci ON i.code = ci.industry_code WHERE ci.company_code = $1', [companyCode])
    ]);

    if (companyResult.rows.length === 0) {
      return res.sendStatus(404);
    }

    const company = companyResult.rows[0];
    company.industries = industriesResult.rows;

    return res.json({ company });
  } catch (err) {

    return next(err);
  }
});


router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const code = slugify(name, { lower: true });
    const result = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [code, name, description]);
    return res.status(201).json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.put('/:code', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const result = await db.query('UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING code, name, description', [name, description, req.params.code]);
    if (result.rows.length === 0) {
      return res.sendStatus(404);
    }
    return res.json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.delete('/:code', async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM companies WHERE code = $1 RETURNING code', [req.params.code]);
    if (result.rows.length === 0) {
      return res.sendStatus(404);
    }
    return res.json({ status: 'deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;


