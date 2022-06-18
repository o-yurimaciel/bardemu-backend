const express = require('express')
const app = express()
const port = process.env.PORT || 5050
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
require('dotenv/config')
app.use(bodyParser())
const { productModel } = require('./models')

const mongoDB = process.env.BARDEMU_DB
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection

db.on('error', console.error.bind(console, 'MongoDB connection error'))

app.get('/', (req, res) => {
  res.send("Up!")
})

app.get('/product', async (req, res) => {
  const products = await productModel.find()
  res.status(200).json({
    products
  })
})

app.post('/product', (req, res) => {
  console.log(req.body)
  const product = {
    name: req.body.name,
    price: req.body.price
  }

  let newProduct = new productModel(product)

  newProduct.save(function(err) {
    if(err) return handleError(err)

    res.status(200).json(product)
  })
})

app.get('/products', (req, res) => {
  res.json(
    products
  )
})

app.listen(port, () => {
  console.log('listening on ', port)
})
