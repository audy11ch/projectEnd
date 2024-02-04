register.post('/api/Register', async (req, res) => {
    try{
        const obj  = req.body;
        let status = 'active';
        if(obj) {
            let checkotp = await db.any(`select * from tempusers where phone_number =  $1 and verify = $2`, [obj.phone,true])
            if(checkotp && checkotp[0]){
                
                if(!obj.type){
                    obj.password = MD5(uuid())
                    encryptedPassword = MD5(obj.password)
                    const currentTimestampInSecondsRegister = Math.floor(Date.now() / 1000);
                    db.any(`insert into users (first_name, last_name, phone_number, password, email, status, phone_contact, create_at) values ($1,$2, $3, $4, $5, $6, $3, $7) returning user_id`, [obj.fName, obj.lName, obj.phone, encryptedPassword, obj.email, status, currentTimestampInSecondsRegister ])
                    .then(function (data) {
                        if(data && data.length > 0) {
                            obj.user_id = data[0].user_id
                            const token = jwt.sign(
                                { user_id: obj.user_id, email: obj.email},
                                process.env.TOKEN_KEY,
                                {
                                    expiresIn: "99y"
                                }
                            )
                            const token_re = jwt.sign(
                                { user_id: obj.user_id, email: obj.email},
                                process.env.TOKEN_KEY_REFEESH,
                                {
                                    expiresIn: "99y"
                                }
                            )
                            db.any('delete from tempusers where phone_number = $1 and verify = $2',[obj.phone,true])
                            return res.status(200).json({ ms: 'good', data: token,tokenre: token_re});
                        }else {
                            
                            return res.status(200).json({ ms: 'bad', data: '-'});
        
                        }
                    }).catch((error) => {
                        console.log('error2 >> ',error);
                        return res.status(200).json({ ms: 'bad', data: ''});
                    })
                }else{
                    let keyid = obj.keyid.replace('key_','')
                    let password = MD5(uuid())
                    db.any(`update users set first_name = $2, last_name = $3, password = $4, email = $5, status = $6, phone_number = $7,phone_contact = $7  where user_id = $1 returning user_id`, [keyid, obj.fName, obj.lName, password, obj.email, status,obj.phone ])
                    .then(function (data) {
                        if(data && data.length > 0) {
                            const token = jwt.sign(
                                { user_id: data[0].user_id, email: data[0].email},
                                process.env.TOKEN_KEY,
                                {
                                    expiresIn: "99y"
                                }
                            )
                            const token_re = jwt.sign(
                                { user_id: data[0].user_id, email: data[0].email},
                                process.env.TOKEN_KEY_REFEESH,
                                {
                                    expiresIn: "99y"
                                }
                            )
                            db.any('delete from tempusers where phone_number = $1 and verify = $2',[obj.phone,true])
                            return res.status(200).json({ ms: 'good', data: token,tokenre: token_re});
                        }else {
                            return res.status(200).json({ ms: 'bad', data: '-'});
        
                        }
                    }).catch((error) => {
                        console.log('error2 >> ',error);
                        return res.status(200).json({ ms: 'bad', data: ''});
                    })
                }
            }else{
                return res.status(200).json({ ms: 'bad', data: 'not found otp'});
            } 
        }else {
            return res.status(200).json({ ms: 'bad', result: 'ส่งของมาให้ครบไอกร๊วกaaaaaaa'});
        }
    
    }catch (err) {
        console.log('error1 >> ',err)
        return res.status(500).json({ ms: 'bad', data: '--' });
    
    }
})