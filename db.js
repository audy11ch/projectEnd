const { Pool } = require('pg')
const db = new Pool({
    host:'aws-0-ap-southeast-1.pooler.supabase.com',
    port:6543,
    user:'postgres.hfqjtmyhaddgdvirkphp',
    password:'Tonphai2544',
    database:'postgres'
})
module.exports = db;