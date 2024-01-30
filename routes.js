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
        const {user,password_1} = req.body
            console.log(user,password_1)
            
        const SELECT = await db.query(`select student_id,firstname from public.user where  student_id = $1 AND password = $2`,[user,password_1])
        if(SELECT.rowCount){
            return res.status(200).json({data:SELECT.rows})
        }
        else{
            return res.status(400).json({msg:"ไม่ถูก--"})
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