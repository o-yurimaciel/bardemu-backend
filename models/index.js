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

module.exports = {
  productModel
}