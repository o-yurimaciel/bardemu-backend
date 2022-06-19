const mongoose = require('mongoose')

const productModel = mongoose.model('product', new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  name: String,
  price: Number,
  description: String,
  image: String
}, {
  collection: 'products'
}))

const categoryModel = mongoose.model('category', new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  name: String,
}, {
  collection: 'categories'
}))

module.exports = {
  productModel,
  categoryModel
}