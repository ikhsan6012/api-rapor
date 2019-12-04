const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
require('dotenv').config()

const { SERVER_PORT, SERVER_HOST, MONGO_URI } = process.env

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

app.use('/dim', require('./routes/dim'))
app.use('/approweb', require('./routes/approweb'))
app.use('/appportal', require('./routes/appportal'))
app.use('/sidjp', require('./routes/sidjp'))
app.use('/tkb', require('./routes/tkb'))
app.use('/data', require('./routes/data'))

mongoose.connect(MONGO_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}, err => {
    if(err){
        console.log(err)
        process.exit()
    }
    console.log('Database connected')
    app.listen(SERVER_PORT || 3001, SERVER_HOST, () => {
        console.log('Server connected!')
    })
})