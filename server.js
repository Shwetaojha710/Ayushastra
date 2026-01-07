const express = require('express')
const { readdirSync } = require('fs')
const app = express()
const cookieParser = require('cookie-parser')
const { configDotenv } = require('dotenv').config()
const cors = require('cors')
const body = require('body-parser')
const path = require('path')
const prescriptions = require('./app/model/prescription')
const prescription_medicines = require('./app/model/prescription_medicines')
const treatment_master = require('./app/model/treatment_master')
const PrakritiUserAnswer = require('./app/model/prakriti_user_answers')
const port = process.env.SERVER_PORT || 9000
const bookingStatusCron=require('./app/controller/cron/bookingStatusCron')
const BulkOrder = require('./app/model/bulkorder')

// const
// require("./cron/bookingStatusCron");

app.use(express.json())
app.use(cors({
  origin: (origin, callback) => {
    callback(null, origin || true);
  },
  credentials: true
}));

app.use(body.json({ limit: '50mb' }))
app.use(body.urlencoded({ extended: true }))

app.use(express.static("upload"));
app.use('/upload', express.static(path.join(__dirname, 'upload')));


readdirSync('./app/routes').map((route) =>

    app.use('/api', require('./app/routes/' + route))
)


app.listen(port, () => console.log(`listening to port:${port} `))


