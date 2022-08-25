const mongoose = require('mongoose')

const productModel = mongoose.model('product', new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  createdAt: Date,
  updatedAt: Date,
  name: String,
  price: Number,
  description: String,
  image: String,
  category: String,
  active: Boolean
}, {
  collection: 'products'
}))

const categoryModel = mongoose.model('category', new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  createdAt: Date,
  updatedAt: Date,
  name: String,
  order: Number,
  active: Boolean
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
  userId: mongoose.Types.ObjectId,
  createdAt: Date,
  updatedAt: Date,
  orderStatus: { 
    type: String, 
    required: true,
    enum: [ 'PENDING', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED' ]
  },
  totalValue: { type: Number, required: true },
  clientName: { type: String, required: true },
  clientPhone: { type: String, required: true },
  clientAddress: { type: String, required: true },
  clientAddressNumber: { type: String, required: true },
  clientAddressData: { type: String },
  paymentType: { type: String, required: true },
  cashChange: Number,
  cardFlag: String,
  deliveryPrice: { type: Number },
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
  collection: 'feedbacks'
}))

const userModel = mongoose.model('user', new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  firstName: { type: String },
  lastName: { type: String },
  fullName: { type: String },
  email: { type: String, unique: true },
  phone: { type: String },
  password: { type: String },
  passwordRecoveryCode: { type: String },
  token: { type: String },
  address: { type: Object },
  role: {
    type: String,
    enum: [
      "MASTER"
    ]
  }
}, {
  collection: 'users'
}))

const districtModel = mongoose.model('district', new mongoose.Schema({
  name: { type: String },
  price: { type: Number },
  value: { type: String }
}, {
  collection: 'districts'
}))

const configsModel = mongoose.model('configs', new mongoose.Schema({
  opening: { type: Object }
}))

const couponsModel = mongoose.model('coupons', new mongoose.Schema({
  name: { type: String, unique: true },
  percent: { type: Number, required: true },
  field: {
    type: String,
    enum: [
      'totalValue',
      'deliveryPrice'
    ]
  },
  active: Boolean
}, {
  collection: 'coupons'
}))

module.exports = {
  productModel,
  categoryModel,
  loginModel,
  orderModel,
  feedbackModel,
  userModel,
  districtModel,
  configsModel,
  couponsModel
}