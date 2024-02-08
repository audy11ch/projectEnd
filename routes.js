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

// Import dotenv if you are using a .env file
// require('dotenv').config();

// Ensure that TOKEN_KEY and TOKEN_KEY_REFRESH are set in your environment or .env file
const tokenKey = process.env.TOKEN_KEY || 'your_default_token_key';
const tokenRefreshKey = process.env.TOKEN_KEY_REFRESH || 'your_default_token_refresh_key';

router.post("/register", async (req, res) => {
    try {
        const { Name, lastname, phone, email, password } = req.body;
        console.log(Name, lastname, phone, email, password);

        const INSERT = await db.query(
            'INSERT INTO public.user (firstname, lastname, phone, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING user_id',
            [Name, lastname, phone, email, password]);
        // Check if the insertion was successful
        if (INSERT.rowCount) {
            const user_id = INSERT.rows[0].user_id;
            const token = jwt.sign(
                { user_id, email, Name, lastname },
                tokenKey, // Use the tokenKey variable here
                {
                    expiresIn: "99y"
                }
            );
            const tokenRefresh = jwt.sign(
                { user_id, email, Name, lastname },
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





// router.post("/insertprofile", async (req, res) => {
//     try {
//         const { Birthday, Gander, Imgprofile } = req.body;
//         console.log(Birthday, Gander, Imgprofile);

//         const INSERT = await db.query(
//             'INSERT INTO public.user (birthday, gander, img_pro) VALUES ($1, $2, $3) RETURNING user_id',
//             [Birthday, Gander, Imgprofile]
//         );
//         if (INSERT.rowCount) {
//             return res.status(200).json({ msg: "INSERT สำเร็จ" });
//         } else {
//             return res.status(400).json({ msg: "INSERT ไม่าสำเร็จ" });
//         }
//     } catch (error) {
//         console.error("Error in /insertprofile endpoint:", error);
//         return res.status(500).json({ error: "Internal server error", details: error.message });
//     }
// });

router.post("/typecar", async (req, res) => {
    try {
        const { btnnunmber, btnnunmber1, btnnunmber2, cartype, colorcar, user_ID } = req.body;

        // Try to insert the record
        const INSERT = await db.query('INSERT INTO public.carnumber (car_number, car_country, car_text, cartype, carcolor) VALUES ($1, $2, $3, $4, $5) RETURNING *', [btnnunmber, btnnunmber1, btnnunmber2, cartype, colorcar]);

        if (INSERT.rowCount) {
            return res.status(200).json({ data: INSERT.rows[0], msg: "Insert successful" });
        } else {
            // If insertion fails, try to update the existing record
            const UPDATE = await db.query('UPDATE public.carnumber SET car_country = $1, car_text = $2, cartype = $3, carcolor = $4 WHERE user_ID = $5 RETURNING *', [btnnunmber1, btnnunmber2, cartype, colorcar, user_ID]);

            if (UPDATE.rowCount) {
                return res.status(200).json({ data: UPDATE.rows[0], msg: "Update successful" });
            } else {
                return res.status(400).json({ msg: "Insert and Update failed" });
            }
        }
    } catch (error) {
        console.error("Error in /typecar endpoint:", error);
        return res.status(500).json({ error: "Internal server error", details: error.message });
    }
});


router.post("/updateprofile", async (req, res) => {
    try {
      const { newName, newLastName, newStudentID, newPhone, dt_date, gander_e, btn_img1 } = req.body;
  
      // ตรวจสอบว่าค่าที่ส่งมาไม่ใช่ null หรือ undefined
      if (newName === undefined || newLastName === undefined || newStudentID === undefined ||
          newPhone === undefined || dt_date === undefined || gander_e === undefined || 
          btn_img1 === undefined) {
        return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน' });
      }
  
      // ดึง user_id จากฐานข้อมูล
      const getUserIdQuery = 'SELECT user_id FROM public.user WHERE firstname = $1 AND lastname = $2';
      db.query(getUserIdQuery, [newName, newLastName], (err, result) => {
        if (err) {
          console.error('เกิดข้อผิดพลาดในการดึง user_id:', err);
          return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึง user_id' });
        }
  
        if (result.length === 0) {
          return res.status(404).json({ message: 'ไม่พบผู้ใช้ที่ตรงกับชื่อและนามสกุลที่ระบุ' });
        }
  
        const user_id = result[0].user_id;
  
        // Try to update the record
        const updateQuery = 'UPDATE public.user SET firstname = ?, lastname = ?, student_id = ?, phone = ?, birthday = ?, gander = ?, img_pro = ? WHERE user_id = ?';
        db.query(updateQuery, [newName, newLastName, newStudentID, newPhone, dt_date, gander_e, btn_img1, user_id], (err, result) => {
          if (err) {
            console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล:', err);
            res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
          } else {
            res.status(200).json({ message: 'การอัปเดตเสร็จสมบูรณ์' });
          }
        });
      });
    } catch (error) {
      console.error("Error in /updateprofile endpoint:", error);
      return res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });
  
  












router.post("/camerasend", async (req, res) => {
    try {
        const { base64String } = req.body;

        // Check if the 'camera' property exists in the request body
        if (!base64String) {
            return res.status(400).json({ error: "Missing 'camera' property in the request body" });
        }

        // Process the 'camera' data as needed
        //   console.log(base64String);
        // ส่งข้อมูลไปให้ python
        const apiUrl = 'http://localhost:5000/api/hello';
        const jsonData = { a: base64String };
        axios.post(apiUrl, jsonData)
            .then(response => {
                console.log('Response from the server:', response.data);
            })
            .catch(error => {
                console.error('Error:', error.message);
            });


        // Send a success response to the client
        return res.status(200).json({ message: "รอฟังก์ชั่นอื่นส่งค่ามา" });
    } catch (error) {
        console.error("Error in /camerasend endpoint:", error);

        // Send an error response to the client
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

        console.log(u_id)
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


module.exports = router;