const { Router } = require('express');
const db = require('./db')
const router = Router();
db.connect()
  .then(() => console.log('ยินดีต้อนรับกลับ'))
  .catch(err => console.error('ออกไป๊', err));
router.post("/",(req,res) =>{
   return res.send("หน้าแรก");
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

router.post("/resister",async(req,res)=>{
    try {
        const obj  = req.body;
        if(obj){
            db.query(`insert into user (email,phone,password) values ($1,$2,$3) returning user_id`,[obj.user,obj.password_1])
        }
    }
    catch(err){
        console.log("ไม่ผ่าน")
    }
})


module.exports = router;