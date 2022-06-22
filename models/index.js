const mongoose = require('mongoose')

const productModel = mongoose.model('product', new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  name: String,
  price: Number,
  description: String,
  image: String,
  category: String
}, {
  collection: 'products'
}))

const categoryModel = mongoose.model('category', new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  name: String,
  order: Number
}, {
  collection: 'categories'
}))

const loginModel = mongoose.model('login', new mongoose.Schema({
  login: String,
  password: String
}, {
  collection: 'login'
}))

module.exports = {
  productModel,
  categoryModel,
  loginModel
}