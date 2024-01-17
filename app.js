const express = require('express');

const apiRouter = require("./routes") 

const app = express();
const port = 3000;

app.use(express.json());

app.get("/",(req,res)=>{
    res.send('hello word')
})
app.use("/api",apiRouter)

app.listen(port,() => console.log(`hello word ${port}`));