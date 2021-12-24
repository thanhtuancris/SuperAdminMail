const express = require('express');
const app = express();
const routes = require('./routes/index.router');
const db = require('./config/connect.database')
const cors = require('cors');
const bodyParser = require('body-parser');
var compression = require('compression')
var device = require('express-device');
var cron = require('cron');
const supports = require('./controller/support')
const port = 3000
app.use(express.urlencoded({
    extended: false 
}));
app.use(express.json({limit: '500mb'}));
app.use(compression()) //nén gzip
app.use(device.capture());
// app.use(bodyParser({limit: '50mb'}))
app.use(cors());
//connect MongoDB
db.connect()
//routes init
routes(app);
app.get('*', function (req, res) {
    res.status(404).json({
        message: "Trang không tồn tại, vui lòng thử lại"
    });
})
app.post('*', function (req, res) {
    res.status(404).json({
        message: "Trang không tồn tại, vui lòng thử lại"
    });
})
const job = new cron.CronJob({
    cronTime: '00 50 23 * * 0-6', // Chạy Jobs vào 23h30 hằng đêm
    onTick: async function () {
        console.log('Cron jub running check mails...');
        supports.autoCheckMail();
    },
    start: true,
    timeZone: 'Asia/Ho_Chi_Minh'
});
job.start();
app.listen(port, () => {
    console.log("Server is running" );
});