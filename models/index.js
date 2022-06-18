const mongoose = require('mongoose')

const productModel = mongoose.model('product', new mongoose.Schema({
  name: String,
  price: Number,
}, {
  collection: 'products'
}))

module.exports = {
  productModel
}