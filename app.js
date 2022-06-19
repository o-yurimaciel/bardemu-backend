const express = require('express')
const app = express()
const port = process.env.PORT || 5050
const mongoose = require('mongoose')
const ObjectId = require('mongoose').Types.ObjectId; 
const bodyParser = require('body-parser')
require('dotenv/config')
app.use(bodyParser())
const { productModel } = require('./models')
const cors = require('cors')

// const mongoDB = process.env.BARDEMU_DB
mongoose.connect('mongodb+srv://bardemu-app:maciel051@bardemu.fjffdzx.mongodb.net/bardemu?retryWrites=true&w=majority', 
{ useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection

app.use(cors({
  origin: '*'
}));

db.on('error', console.error.bind(console, 'MongoDB connection error'))

app.get('/', (req, res) => {
  res.send("Up!")
})

app.get('/product', async (req, res) => {
  console.log('/product', req.query)
  let products;

  if(req.query && req.query._id) {
    const id = new ObjectId(req.query._id)
    console.log(id)
    products = await productModel.find({ _id: id})
    console.log('ue', products)
  } else {
    products = await productModel.find()
  }

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

app.delete('/product', async (req, res) => {
  console.log(req.body)
  const id = new ObjectId(req.body._id)
  await productModel.deleteOne({ _id: id })
  res.status(200).json({})
})

app.listen(port, () => {
  console.log('listening on ', port)
})
