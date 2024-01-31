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
            
        const SELECT = await db.query(`select email,firstname from public.user where  email = $1 AND password = $2`,[user,password_1])
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
router.post("/insertdata", async (req, res) => {
  try {
    const { NaMe, lastname, pho_ne, emai_l } = req.body;
    console.log(NaMe, lastname, pho_ne, emai_l);

    const INSERT = await db.query('INSERT INTO public.user (firstname, lastname, phone, email) VALUES ($1, $2, $3, $4)', [NaMe, lastname, pho_ne, emai_l]);

    // Check if the insertion was successful
    if (INSERT.rowCount !== null && INSERT.rowCount > 0) {
      return res.status(200).json({data:INSERT.rows})
    } else {
      return res.status(400).json({ msg: "Insertion failed" });
    }
  } catch (error) {
    console.error("Error in /insertdata endpoint:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
});





module.exports = router;