const request = require('supertest');
const app = require('../app');
const db = require('../db');

beforeEach(async () => {
  await db.query('DELETE FROM companies');
  await db.query("INSERT INTO companies (code, name, description) VALUES ('apple', 'Apple Computer', 'Maker of OSX.')");
});

afterAll(async () => {
  await db.end();
});

describe('GET /companies', () => {
  test('Gets a list of companies', async () => {
    const response = await request(app).get('/companies');
    expect(response.statusCode).toBe(200);
    expect(response.body.companies[0]).toHaveProperty('code');
    expect(response.body.companies[0]).toHaveProperty('name');
  });
});

describe('GET /companies/:code', () => {
  test('Gets a single company', async () => {
    const response = await request(app).get('/companies/apple');
    expect(response.statusCode).toBe(200);
    expect(response.body.company).toHaveProperty('code');
    expect(response.body.company).toHaveProperty('name');
    expect(response.body.company).toHaveProperty('description');
  });

  test('Responds with 404 for invalid company code', async () => {
    const response = await request(app).get('/companies/banana');
    expect(response.statusCode).toBe(404);
  });
});

describe('POST /companies', () => {
  test('Creates a new company', async () => {
    const response = await request(app)
      .post('/companies')
      .send({ code: 'ibm', name: 'IBM', description: 'Big blue.' });
    expect(response.statusCode).toBe(201);
    expect(response.body.company).toHaveProperty('code');
    expect(response.body.company).toHaveProperty('name');
    expect(response.body.company).toHaveProperty('description');
  });
});