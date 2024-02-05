const express = require('express');
const cors = require('cors');
const apiRouter = require("./routes") 
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));
app.use(express.json());
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//     next();
//  });
 app.use(cors(
    // origin: 'http://127.0.0.1:5500',
));
app.use("/api",apiRouter)
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
