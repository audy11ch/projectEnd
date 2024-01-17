const { Pool } = require('pg')
const db = new Pool({
    host:'db.hfqjtmyhaddgdvirkphp.supabase.co',
    port:5432,
    user:'postgres',
    password:'tonphai2544',
    database:'postgres'
})
module.exports = db;