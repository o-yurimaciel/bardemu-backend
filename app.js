const express = require('express')
const app = express()
const port = process.env.PORT || 5050
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
require('dotenv/config')
app.use(bodyParser())
const cors = require('cors')
const productRouter = require('./routes/product')
const categoryRouter = require('./routes/category')
const loginRouter = require('./routes/login')

// const mongoDB = process.env.BARDEMU_DB
mongoose.connect('mongodb+srv://bardemu-app:maciel051@bardemu.fjffdzx.mongodb.net/bardemu?retryWrites=true&w=majority', 
{ useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection

app.use(cors({
  origin: '*'
}));

app.use(productRouter)
app.use(categoryRouter)
app.use(loginRouter)

db.on('error', console.error.bind(console, 'MongoDB connection error'))

app.get('/', (req, res) => {
  res.send("Up!")
})

app.listen(port, () => {
  console.log('listening on ', port)
})
