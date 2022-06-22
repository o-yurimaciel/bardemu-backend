const express = require('express')
const router = express.Router()
const { productModel } = require('../models')
const ObjectId = require('mongoose').Types.ObjectId; 

router.get('/product', async (req, res) => {
  let products;

  if(req.query && req.query._id) {
    const id = new ObjectId(req.query._id)
    products = await productModel.findById(id)
  } else {
    products = await productModel.find()
  }

  res.status(200).json(products)
})

router.post('/product', (req, res) => {
  const product = {
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    description: req.body.description ? req.body.description : '',
    price: req.body.price ? req.body.price : 0,
    image: req.body.image ? req.body.image : null,
    category: req.body.category
  }

  let newProduct = new productModel(product)

  newProduct.save(function(err) {
    console.log(err)
    res.status(200).json(product)
  })
})

router.delete('/product', async (req, res) => {
  const id = new ObjectId(req.body._id)
  await productModel.deleteOne({ _id: id })
  res.status(200).json({})
})

router.put('/product', async (req, res) => {
  const id = new ObjectId(req.query._id)

  await productModel.findOneAndReplace({
    _id: id
  }, req.body)

  res.status(200).json(req.body)
})

module.exports = router