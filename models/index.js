const mongoose = require('mongoose')

const productModel = mongoose.model('product', new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  createdAt: Date,
  updatedAt: Date,
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
  createdAt: Date,
  updatedAt: Date,
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

const orderModel = mongoose.model('order', new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  createdAt: Date,
  updatedAt: Date,
  orderStatus: { type: String, required: true },
  totalValue: { type: Number, required: true },
  clientName: { type: String, required: true },
  clientPhone: { type: String, required: true },
  clientAddress: { type: String, required: true },
  clientAddressNumber: { type: String, required: true },
  clientAddressData: { type: String },
  paymentType: { type: String, required: true },
  cashChange: Number,
  cardFlag: String,
  products: { type: Array, required: true },
  estimatedTime: { type: Number },
  deliveryId: { type: String },
  orderStatusHistory: Array,
  message: { type: String },
  feedback: { type: Object }
}, {
  collection: 'order'
}))

const feedbackModel = mongoose.model('feedback', new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  orderId: { type: mongoose.Types.ObjectId, required: true },
  createdAt: Date,
  message: String,
  rating: { type: Number, required: true}
}, {
  collection: 'feedback'
}))

const userModel = mongoose.model('user', new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  token: { type: String }
}))

module.exports = {
  productModel,
  categoryModel,
  loginModel,
  orderModel,
  feedbackModel,
  userModel
}