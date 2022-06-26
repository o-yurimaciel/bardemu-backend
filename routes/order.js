const express = require('express')
const router = express.Router()
const { orderModel } = require('../models')
const ObjectId = require('mongoose').Types.ObjectId;
const mongoose = require('mongoose')

router.get('/orders', (req, res) => {
  orderModel.find(function(err, response) {
    if(err) {
      res.status(400).json(err)
    }
    res.status(200).json(response)
  })
})

router.get('/order', async (req, res) => {
  const { _id } = req.query

  if(_id) {
    const result = await orderModel.findOne({
      _id: new ObjectId(_id)
    })
  
    if(result) {
      res.status(200).json(result)
    } else {
      res.status(404).json({
        message: 'Not Found'
      })
    }
  } else {
    res.status(404).json({
      message: 'Validation failure'
    })
  }
})

router.post('/order', (req, res) => {
  const { 
    totalValue,
    clientName, 
    clientPhone, 
    clientAddress, 
    clientAddressName, 
    clientAddressNumber, 
    paymentType, 
    cashChange, 
    cardFlag,
    products
  } = req.body

  const newOrder = new orderModel({
    _id: new mongoose.Types.ObjectId(),
    orderStatus: "PENDING",
    totalValue,
    products,
    clientName,
    clientPhone,
    clientAddress,
    clientAddressName,
    clientAddressNumber,
    paymentType,
    cashChange,
    cardFlag
  })

  newOrder.save(function(err) {
    if(err) {
      res.status(400).json(err)
    }
    res.status(200).json(newOrder)
  })
})

module.exports = router

