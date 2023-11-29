const request = require('supertest');
const app = require('../app');
const db = require('../db');

beforeEach(async () => {
  await db.query('DELETE FROM invoices');
  await db.query("INSERT INTO invoices (comp_code, amt) VALUES ('apple', 100)");
});

afterAll(async () => {
  await db.end();
});

describe('GET /invoices', () => {
  test('Gets a list of invoices', async () => {
    const response = await request(app).get('/invoices');
    expect(response.statusCode).toBe(200);
    expect(response.body.invoices[0]).toHaveProperty('id');
    expect(response.body.invoices[0]).toHaveProperty('comp_code');
  });
});

describe('GET /invoices/:id', () => {
    test('Gets a single invoice', async () => {
     
      const newInvoice = await request(app)
        .post('/invoices')
        .send({ comp_code: 'apple', amt: 200 });
  
      const invoiceId = newInvoice.body.invoice.id;
  
      const response = await request(app).get(`/invoices/${invoiceId}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.invoice).toHaveProperty('id');
      expect(response.body.invoice).toHaveProperty('amt');
      expect(response.body.invoice).toHaveProperty('paid');
    });
  });

describe('POST /invoices', () => {
  test('Creates a new invoice', async () => {
    const response = await request(app)
      .post('/invoices')
      .send({ comp_code: 'apple', amt: 200 });
    expect(response.statusCode).toBe(201);
    expect(response.body.invoice).toHaveProperty('id');
    expect(response.body.invoice).toHaveProperty('comp_code');
    expect(response.body.invoice).toHaveProperty('amt');
    expect(response.body.invoice).toHaveProperty('paid');
    expect(response.body.invoice).toHaveProperty('add_date');
    expect(response.body.invoice).toHaveProperty('paid_date');
  });
});