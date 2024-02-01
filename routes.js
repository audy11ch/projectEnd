const { Router } = require('express');
const jwt = require('jsonwebtoken');
const db = require('./db')
const router = Router();

db.connect()
    .then(() => console.log('ยินดีต้อนรับกลับ'))
    .catch(err => console.error('ออกไป๊', err));
router.post('/',(req,res) =>res.json({msg:'JWT'}) ) 


router.post("/login", async (req, res) => {
    try {
        const { user, password_1 } = req.body
        console.log(user, password_1)

        const SELECT = await db.query(`select email,firstname from public.user where  email = $1 AND password = $2`, [user, password_1])
        if (SELECT.rowCount) {
            return res.status(200).json({ data: SELECT.rows })
        }
        else {
            return res.status(400).json({ msg: "ไม่ถูก--" })
        }
    } catch (error) {
        console.log(error)
    }
})
// Import dotenv if you are using a .env file
// require('dotenv').config();

// Ensure that TOKEN_KEY and TOKEN_KEY_REFRESH are set in your environment or .env file
const tokenKey = process.env.TOKEN_KEY || 'your_default_token_key';
const tokenRefreshKey = process.env.TOKEN_KEY_REFRESH || 'your_default_token_refresh_key';

router.post("/register", async (req, res) => {
    try {
        const { Name, lastname, phone, email, password } = req.body;
        console.log(Name, lastname, phone, email, password);

        const INSERT = await db.query('INSERT INTO public.user (firstname, lastname, phone, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING user_id', [Name, lastname, phone, email, password]);

        // Check if the insertion was successful
        if (INSERT.rowCount) {
            const user_id = INSERT.rows[0].user_id;
            const token = jwt.sign(
                { user_id, email,Name,lastname },
                tokenKey, // Use the tokenKey variable here
                {
                    expiresIn: "99y"
                }
            );
            const tokenRefresh = jwt.sign(
                { user_id, email,Name,lastname },
                tokenRefreshKey, // Use the tokenRefreshKey variable here
                {
                    expiresIn: "99y"
                }
            );
            return res.status(200).json({ data: { user_id, token, tokenRefresh } });
        } else {
            return res.status(400).json({ msg: "Insertion failed" });
        }
    } catch (error) {
        console.error("Error in /register endpoint:", error);
        return res.status(500).json({ error: "Internal server error", details: error.message });
    }
});


router.post("/typecar", async (req, res) => {
    try {
        const { cartype,colorcar,btnnunmber,btnnunmber1,btnnunmber2 } = req.body;
        console.log(cartype,colorcar,btnnunmber,btnnunmber1,btnnunmber2);

        const INSERT = await db.query('INSERT INTO public.carnumber (car_number,car_country,car_text,cartype,carcolor)  VALUES ($1, $2)', [cartype, colorcar,btnnunmber,btnnunmber1,btnnunmber2]);

        // Check if the insertion was successful
        if (INSERT.rowCount) {
            return res.status(200).json({ data: INSERT.rows[0] }); // Returning the first inserted row
        } else {
            return res.status(400).json({ msg: "Insertion failed" });
        }
    } catch (error) {
        console.error("Error in /insertcar endpoint:", error);
        return res.status(500).json({ error: "Internal server error", details: error.message });
    }
});






module.exports = router;