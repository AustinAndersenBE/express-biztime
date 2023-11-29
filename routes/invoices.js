const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const result = await db.query('SELECT id, comp_code FROM invoices');
    return res.json({ invoices: result.rows });
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query('SELECT i.id, i.amt, i.paid, i.add_date, i.paid_date, c.code, c.name, c.description FROM invoices AS i JOIN companies AS c ON i.comp_code = c.code WHERE i.id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.sendStatus(404);
    }
    const data = result.rows[0];
    const invoice = {
      id: data.id,
      amt: data.amt,
      paid: data.paid,
      add_date: data.add_date,
      paid_date: data.paid_date,
      company: {
        code: data.code,
        name: data.name,
        description: data.description
      }
    };
    return res.json({ invoice });
  } catch (err) {
    return next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const result = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date', [comp_code, amt]);
    return res.status(201).json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { amt, paid } = req.body;
    let paidDate = null;

    // See if invoice is currently paid
    const currentInvoiceResult = await db.query('SELECT paid FROM invoices WHERE id = $1', [req.params.id]);
    if (currentInvoiceResult.rows.length === 0) {
      return res.sendStatus(404);
    }
    const currentInvoice = currentInvoiceResult.rows[0];

    // If invoice has been marked paid and was not paid before, set paid_date
    if (paid && !currentInvoice.paid) {
      paidDate = new Date();
    } else if (!paid) {
      // If the invoice is being marked as unpaid, clear the paid_date
      paidDate = null;
    } else {
      // Otherwise, keep the current paid_date
      paidDate = currentInvoice.paid_date;
    }

    const result = await db.query('UPDATE invoices SET amt = $1, paid = $2, paid_date = $3 WHERE id = $4 RETURNING id, comp_code, amt, paid, add_date, paid_date', [amt, paid, paidDate, req.params.id]);
    if (result.rows.length === 0) {
      return res.sendStatus(404);
    }
    return res.json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM invoices WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.sendStatus(404);
    }
    return res.json({ status: 'deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;