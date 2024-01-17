const { Router } = require('express');
const db = require('./db')
const router = Router();
db.connect()
  .then(() => console.log('Connected to the database doanything file'))
  .catch(err => console.error('Error connecting to the database', err));
router.post("/",(req,res) =>{
   return res.send("using api router");
});
router.post("/tontai",async(req,res)=>{
    try {
        const {name,phone} = req.body
        const SELECT = await db.query(`select * from login where firstname = $1 AND phone = $2`,[name,phone])
        if(SELECT.rowCount){
            return res.status(200).json({data:SELECT.rows})
        }
        else{
            return res.status(200).json({data:"ไม่ถูก--"})
        }
    } catch (error) {
        console.log(error)
    }
})
module.exports = router;