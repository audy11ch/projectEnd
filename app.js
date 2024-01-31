const express = require('express');

const apiRouter = require("./routes") 

const app = express();
const port = 3000;

app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
 });

app.use("/api",apiRouter)
app.listen(port,() => console.log(`hello word ${port}`));