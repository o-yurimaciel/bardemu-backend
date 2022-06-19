const express = require('express')
const app = express()
const port = process.env.PORT || 5050
const mongoose = require('mongoose')
const ObjectId = require('mongoose').Types.ObjectId; 
const bodyParser = require('body-parser')
require('dotenv/config')
app.use(bodyParser())
const { productModel, categoryModel } = require('./models')
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
    products = await productModel.findById(id)
    console.log('ue', products)
  } else {
    products = await productModel.find()
  }

  res.status(200).json({
    products
  })
})

app.get('/category', async (req, res) => {
  let categories;

  if(req.query && req.query._id) {
    const id = new ObjectId(req.query._id)
    categories = await categoryModel.findById(id)
  } else {
    categories = await categoryModel.find()
  }

  res.status(200).json(categories)
})

app.post('/product', (req, res) => {
  console.log(req.body)
  const product = {
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    description: req.body.description ? req.body.description : '',
    price: req.body.price ? req.body.price : 0,
    image: req.body.image ? req.body.image : null
  }

  let newProduct = new productModel(product)

  newProduct.save(function(err) {
    console.log(err)
    res.status(200).json(product)
  })
})

app.post('/category', (req, res) => {
  const category = {
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
  }

  let newCategory = new categoryModel(category)

  newCategory.save(function(err) {
    console.log(err)
    res.status(200).json(category)
  })
})

app.delete('/category', async (req, res) => {
  console.log(req.body)
  const id = new ObjectId(req.body._id)
  await categoryModel.deleteOne({ _id: id })
  res.status(200).json({})
})

app.delete('/product', async (req, res) => {
  console.log(req.body)
  const id = new ObjectId(req.body._id)
  await productModel.deleteOne({ _id: id })
  res.status(200).json({})
})

app.put('/product', async (req, res) => {
  console.log(req.body)
  const id = new ObjectId(req.query._id)

  await productModel.findOneAndReplace({
    _id: id
  }, req.body)

  res.status(200).json(req.body)
})

app.put('/category', async (req, res) => {
  console.log(req.body)
  const id = new ObjectId(req.query._id)

  await categoryModel.findOneAndReplace({
    _id: id
  }, req.body)

  res.status(200).json(req.body)
})

app.listen(port, () => {
  console.log('listening on ', port)
})
