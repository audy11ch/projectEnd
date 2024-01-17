const { Pool } = require('pg')
const db = new Pool({
    host:'localhost',
    port:5432,
    user:'postgres',
    password:'516302',
    database:'projectEnd'
})
module.exports = db;