/** Database setup for BizTime. */
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.NODE_ENV === 'test' ? 
    'postgresql://senhua:asdf1234@localhost/biztime_test' : 
    'postgresql://senhua:asdf1234@localhost/biztime'
});

client.connect();

module.exports = client;

