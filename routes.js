const { Router } = require('express');
const jwt = require('jsonwebtoken');
const db = require('./db')
const router = Router();
const axios = require('axios');

db.connect()
    .then(() => console.log('ยินดีต้อนรับกลับ'))
    .catch(err => console.error('ออกไป๊', err));
router.post('/', (req, res) => res.json({ msg: 'JWT' }))


process.env.JWT_KEY = 'your_long_random_secret_key_here';
const SecretKey = 'your_long_random_secret_key_here';

router.post("/login", async (req, res) => {
    try {
        const { user, password_1 } = req.body;
        console.log(user, password_1);

        const SELECT = await db.query(
            `SELECT user_id, email, firstname, lastname FROM public.user WHERE email = $1 AND password = $2`,
            [user, password_1]
        );
        if (SELECT.rowCount) {
            const user_id = SELECT.rows[0].user_id;

            const token = jwt.sign(
                { user_id, email: SELECT.rows[0].email, Name: SELECT.rows[0].firstname, lastname: SELECT.rows[0].lastname },
                process.env.JWT_KEY,
                { expiresIn: "99y" }
            );

            const tokenRefresh = jwt.sign(
                { user_id, email: SELECT.rows[0].email, Name: SELECT.rows[0].firstname, lastname: SELECT.rows[0].lastname },
                process.env.JWT_KEY,
                { expiresIn: "99y" }
            );

            return res.status(200).json({ data: { user_id, token, tokenRefresh } });
        } else {
            return res.status(400).json({ msg: "Login failed" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error", details: error.message });
    }
});

router.post("/check_email", async (req, res) => {
    try {
        const { email } = req.body;
        console.log(email);

        const SELECT = await db.query(
            `SELECT user_id FROM public.user WHERE email = $1`,
            [email]

        );
        if (SELECT.rowCount) {
            const user_id = SELECT.rows[0].user_id;

            return res.status(200).json({ data: { user_id } });
        } else {
            return res.status(401).json({ msg: "Login failed" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error", details: error.message });
    }
});

router.post("/updatepass", async (req, res) => {
    try {
        const { password, user_id } = req.body;
        // const user_id = req.body.user_id;
        console.log(password, user_id)
        // const SELECT = await db.query(
        //     `SELECT user_id FROM public.user WHERE email = $1`,
        //     [password]

        // );
        if (password && user_id) {
            // const { password } = req.body;
            const update = await db.query('UPDATE public.user SET password = $1 WHERE user_id = $2;',
                [password, user_id]);
            if (update.rowCount) {
                return res.status(200).json({ message: 'Password updated successfully' });
            } else {
                return res.status(404).json({ message: 'User not found' });
            }
        } else {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile', details: error.message });
    }
});
// Import dotenv if you are using a .env file
// require('dotenv').config();

// Ensure that TOKEN_KEY and TOKEN_KEY_REFRESH are set in your environment or .env file
const tokenKey = process.env.TOKEN_KEY || 'your_default_token_key';
const tokenRefreshKey = process.env.TOKEN_KEY_REFRESH || 'your_default_token_refresh_key';

router.post("/register", async (req, res) => {
    try {
        const { Name, lastname, phone, email, password, studentID, carint ,carcouty} = req.body;

        const INSERT_USER = await db.query(
            'INSERT INTO public.user (firstname, lastname, phone, email, student_id, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [Name, lastname, phone, email, studentID, password]
        );

        if (INSERT_USER.rowCount) {
            const user_id = INSERT_USER.rows[0].user_id;

            const INSERT_CAR = await db.query(
                'INSERT INTO public.carnumber (car_number, car_country, user_id) VALUES ($1, $2, $3) RETURNING *',
                [carint, carcouty ,user_id]
            );

            if (INSERT_CAR.rowCount) {
                const token = jwt.sign(
                    { user_id, email, Name, lastname },
                    tokenKey,
                    { expiresIn: "99y" }
                );
                const tokenRefresh = jwt.sign(
                    { user_id, email, Name, lastname },
                    tokenRefreshKey,
                    { expiresIn: "99y" }
                );

                return res.status(200).json({ data: { user_id, token, tokenRefresh } });
            } else {
                return res.status(400).json({ msg: 'Car insertion failed' });
            }
        } else {
            return res.status(400).json({ msg: 'User insertion failed' });
        }
    } catch (error) {
        console.error("Error in /register endpoint:", error);
        return res.status(500).json({ error: "Internal server error", details: error.message });
    }
});


router.post("/updateprofile", async (req, res) => {
    try {
        const token = req.header('Authorization');

        const user_id = (JSON.parse(token)).user_id
        console.log(user_id)
        if (user_id) {
            const { newName, newLastName, newPhone, dt_date, gander_e, btn_img1, carint, carcounty, cartype ,carcolor ,piccar} = req.body;

            const update = await db.query('UPDATE public.user SET firstname = $1, lastname = $2, phone = $3, birthday = $4, gander = $5, img_pro = $6 WHERE user_id = $7;',
                [newName, newLastName, newPhone, dt_date, gander_e, btn_img1, user_id]);

            if (update.rowCount) {
                const updatecar = await db.query('UPDATE public.carnumber SET car_number = $1, car_country = $2, cartype = $3, carcolor = $4 , img_car = $5 WHERE user_id = $6;',
                    [carint, carcounty, cartype, carcolor, piccar ,user_id]);

                if (updatecar.rowCount) {
                    return res.status(200).json({ ms: 'good', data: updatecar.rows[0] });
                } else {
                    res.status(500).json({ error: 'Failed to update profile', details: 'No rows affected' });
                }
            }


        } else {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile', details: error.message });
    }
});

router.post("/editpass", async (req, res) => {
    try {
        const token = req.header('Authorization');
        const user_id = (JSON.parse(token)).user_id
        console.log(user_id)
        if (user_id) {
            const { password } = req.body;

            const update = await db.query('UPDATE public.user SET password = $1 WHERE user_id = $2;',
                [password, user_id]);

                if (update.rowCount) {
                    return res.status(200).json({ message: 'Password updated successfully' });
                } else {
                    return res.status(404).json({ message: 'User not found' });
                }
        } else {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile', details: error.message });
    }
});


router.post("/camerasend", async (req, res) => {
    try {
        const { base64String } = req.body;

        if (!base64String) {
            return res.status(400).json({ error: "Missing 'base64String' property in the request body" });
        }

        const apiUrl = 'http://localhost:5000/api/hello';
        const jsonData = { a: base64String };
        const response = await axios.post(apiUrl, jsonData);
        console.log(response.data);

        // Assuming response.data contains the text extracted from the image
        const carNumber = response.data.license_plate;

        // Sanitize and validate carNumber before using it in the query (for security)
        // ...

        // Execute the database query to find carNumber in public.carnumber
        const SELECT_CAR_NUMBER = await db.query(
            'SELECT * FROM public.carnumber WHERE car_number = $1',
            [carNumber]
        );

        if (SELECT_CAR_NUMBER.rows.length > 0) {
            const user_id_from_carnumber = SELECT_CAR_NUMBER.rows[0].user_id;

            const SELECT_USER = await db.query(
                'SELECT * FROM public.user WHERE user_id = $1',
                [user_id_from_carnumber]
            );

            if (SELECT_USER.rows.length > 0) {
                // Handle the user data as needed
                const userData = SELECT_USER.rows[0];
                
                // Combine car and user data into a response object
                const combinedResponse = {
                    data: {
                        car: SELECT_CAR_NUMBER.rows[0],
                        user: userData
                    }
                };

                return res.status(200).json(combinedResponse);
            } else {
                // Handle the case where the user_id from public.carnumber doesn't exist in public.user
                console.log('User not found in public.user');
                return res.status(404).json({ error: 'User not found' });
            }
        } else {
            // Handle the case where car_number doesn't exist in public.carnumber
            console.log('Car number not found in public.carnumber');
            return res.status(404).json({ error: 'Car number not found' });
        }
    } catch (error) {
        console.error("Error in /camerasend endpoint:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});





function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, SecretKey, (err, decoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(decoded);
            }
        });
    });
}

router.post("/token", async (req, res) => {

    try {
        const token = req.headers.authorization;
        const token_data = await verifyToken(token);

        const u_id = token_data.user_id

        // console.log(u_id)
        const SELECT = await db.query(
            `SELECT user_id FROM public.user WHERE user_id = $1 `, [u_id]);
        if (SELECT.rowCount) {
            return res.status(200).json({ check_user: SELECT.rowCount });
        }
        else {
            return res.status(400).json({ msg: "Insertion failed" });
        }

    } catch (error) {
        return res.status(500).json({ error: "Internal server error", details: error.message });
    }

})
router.post('/Get-Profile', async (req, res) => {
    try {
        const token = req.header('Authorization');

        // Check if token is not present
        if (!token) {
            return res.status(401).json({ error: "Unauthorized", details: "Token not provided" });
        }

        // Parse the token and extract user_id
        const decodedToken = JSON.parse(token);
        const user_id = decodedToken.user_id;

        // Check if user_id is present
        if (!user_id) {
            return res.status(401).json({ error: "Unauthorized", details: "Invalid token format - user_id missing" });
        }

        console.log(user_id);

        // Use user_id in your database query
        const data = await db.query('SELECT user_id, student_id, firstname, lastname, img_pro, phone, email, gander, birthday,driving_license FROM public.user WHERE user_id = $1', [user_id]);
        const carData = await db.query('SELECT user_id, car_number, car_country, cartype, carcolor FROM public.carnumber WHERE user_id = $1', [user_id]);

        // Check if userData or carData is present and return the appropriate response
        if (data.rows.length > 0) {
            const response = { status: 'success', data: data.rows };

            if (carData.rows.length > 0) {
                response.data = [...response.data, ...carData.rows];
            }

            return res.status(200).json(response);
        } else {
            return res.status(404).json({ status: 'not found', details: 'User not found' });
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
router.post("/driving_img", async (req, res) => {
    try {
        const token = req.header('Authorization');

        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized: Token missing" });
        }

        const user_id = JSON.parse(token).user_id;

        if (!user_id) {
            return res.status(401).json({ success: false, message: "Unauthorized: Invalid user ID in token" });
        }

        const { driving_license } = req.body;

        if (!driving_license) {
            return res.status(400).json({ success: false, message: "Bad Request: Missing driving license in request body" });
        }

        const updatedriving = await db.query(
            'UPDATE public.user SET driving_license = $1 WHERE user_id = $2;', 
            [driving_license, user_id]
        );

        if (updatedriving.rowCount) {
            return res.status(200).json({ success: true, message: 'Driving license updated successfully', data: updatedriving.rows[0] });
        } else {
            return res.status(404).json({ success: false, message: "Not Found: User not found or driving license not updated." });
        }
    } catch (error) {
        console.error("Error in /driving_img endpoint:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error", details: error.message });
    }
});

module.exports = router;