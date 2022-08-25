const express = require('express')
const app = express()
const port = process.env.PORT || 5050
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
require('dotenv/config')
const cors = require('cors')
const productRouter = require('./routes/product')
const categoryRouter = require('./routes/category')
const orderRouter = require('./routes/order')
const feedbackRouter = require('./routes/feedback')
const userRouter = require('./routes/user')
const districtRouter = require('./routes/district')
const configsRouter = require('./routes/configs')
const couponsRouter = require('./routes/coupons')
const appWs = require('./websocket')
const eventEmitter = require('./eventEmitter')

mongoose.connect(process.env.BARDEMU_DB, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection

app.use(bodyParser.json())
app.use(cors({
  origin: '*'
}));

app.use(productRouter)
app.use(categoryRouter)
app.use(orderRouter)
app.use(feedbackRouter)
app.use(userRouter)
app.use(districtRouter)
app.use(configsRouter)
app.use(couponsRouter)

db.on('error', console.error.bind(console, 'MongoDB connection error'))

app.get('/', (req, res) => {
  res.send("Up!")
})

const server = app.listen(port, () => {
  console.log('listening on ', port)
})

const wss = appWs(server)

eventEmitter.on('wss-broadcast', (data) => {
  wss.broadcast(data)
}).setMaxListeners(0)