const { Router } = require('express');
const jwt = require('jsonwebtoken');
const db = require('./db')
const router = Router();

db.connect()
    .then(() => console.log('ยินดีต้อนรับกลับ'))
    .catch(err => console.error('ออกไป๊', err));
router.post('/',(req,res) =>res.json({msg:'JWT'}) ) 

const TOKENKEY = process.env.TOKEN_KEY || 'your_default_token_key';
const tokenReKey = process.env.TOKEN_KEY_REFRESH || 'your_default_token_refresh_key';

router.post("/login", async (req, res) => {
    

    try {
        const { user, password_1 } = req.body;
        console.log(user, password_1);

        // Assuming you're using 'db.query' to check user credentials
        const SELECT = await db.query(`SELECT email, firstname FROM public.user WHERE email = $1 AND password = $2`, [user, password_1]);
        if (SELECT.rowCount) {
            const user_id = SELECT.rows[0].user_id;  // <-- Fix here
            const token = jwt.sign(
                { user_id: SELECT.rows[0].user_id, email: SELECT.rows[0].email },
                TOKENKEY,
                {
                    expiresIn: "99y"
                }
            );
        
            const token_re = jwt.sign(
                { user_id: SELECT.rows[0].user_id, email: SELECT.rows[0].email },
                tokenReKey,
                {
                    expiresIn: "99y"
                }
            );
        
            return res.status(200).json({ user_id, token, token_re });
        } else {
            return res.status(200).json({ ms: 'bad3', data: '-' });
        }        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error", details: error.message });
    }
});


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
        const { btnnunmber,btnnunmber1,btnnunmber2,cartype,colorcar } = req.body;
        console.log(btnnunmber,btnnunmber1,btnnunmber2,cartype,colorcar);

        const INSERT = await db.query('INSERT INTO public.carnumber (car_number,car_country,car_text,cartype,carcolor)  VALUES ($1, $2, $3, $4, $5)', [btnnunmber,btnnunmber1,btnnunmber2,cartype,colorcar]);

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