const express = require('express')
const router = express.Router()
const { orderModel } = require('../models')
const ObjectId = require('mongoose').Types.ObjectId;
const mongoose = require('mongoose');
const { default: axios } = require('axios');

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

  const orderStatus = "PENDING"

  const newOrder = new orderModel({
    _id: new mongoose.Types.ObjectId(),
    orderStatus,
    totalValue,
    products,
    clientName,
    clientPhone,
    clientAddress,
    clientAddressName,
    clientAddressNumber,
    paymentType,
    cashChange,
    cardFlag,
    orderStatusHistory: [
      {
        status: orderStatus,
        date: new Date().toISOString()
      }
    ]
  })

  newOrder.save(function(err) {
    if(err) {
      res.status(400).json(err)
    }
    axios.post('https://graph.facebook.com/v13.0/111055524984269/messages', {
      messaging_product: "whatsapp",
      to: clientPhone.replace(/[^0-9]/g, ''),
      type: "text",
      text: {
        preview_url: false,
        body: `Olá ${clientName}! O seu pedido foi computado e está aguardando confirmação.`
      }
    }, {
      headers: {
        Authorization: 'Bearer EAAEwitQakngBAGbRCL1wJvNCDmwxkcZAmwsEj2sZCVOCbwedvo3turCohdV1gfXeOTKNpDB8PyZCaFwAZCJJvZCVsArjSZCbXXYFg4ZBcvLkB4tBIZBkIqe11zfEerVjK5NBtn4ou9BcFQ7lMv0XNyBVE92QIQzuqIqprnGmoL5QRPg4CxZAswbVxv828DHsOkr7Jfw7TvMoBwgZDZD'
      }
    }).then((res) => {
      console.log(res)
      res.status(200).json(newOrder)
    }).catch((e) => {
      console.log(e.response)
      res.status(200).json(newOrder)
    })
  })
})

router.put('/order', async (req, res) => {
  const { _id } = req.query
  const { orderStatus, estimatedTime } = req.body

  const order = await orderModel.findOne({
    _id: _id
  })

  const statusAlreadyExist = order.orderStatusHistory.some((history) => history.status === orderStatus)

  if(statusAlreadyExist) {
    res.status(400).json({
      message: `Status '${orderStatus}' already registered in order`,
      order: order
    })
  } else {
    const result = await orderModel.findOneAndUpdate({
      _id: new ObjectId(_id)
    }, {
      orderStatus,
      estimatedTime,
      $push: {
        orderStatusHistory: {
          status: orderStatus,
          date: new Date().toISOString()
        }
      }
    }, {
      new: true
    })
  
    if(result) {
      let message;
  
      switch(orderStatus) {
        case "CONFIRMED":
          message = `Olá, ${order.clientName}! O seu pedido foi confirmado e está sendo preparado. Você pode acompanhá-lo pelo link https://bardemu.com.br/pedido/${order.id}`
          break
        case "OUT_FOR_DELIVERY":
          message = `Olá, ${order.clientName}! O seu pedido acabou de sair para entrega.`
          break
        case "DELIVERED":
          message = `Olá, ${order.clientName}! O seu pedido foi entregue. Por favor, avalie a sua entrega aqui -> https://bardemu.com.br/pedido/${order._id}`
          break
      }
  
      axios.post('https://graph.facebook.com/v13.0/111055524984269/messages', {
        messaging_product: "whatsapp",
        to: order.clientPhone.replace(/[^0-9]/g, ''),
        type: "text",
        text: {
          preview_url: false,
          body: message
        }
      }, {
        headers: {
          Authorization: 'Bearer EAAEwitQakngBADmabwalYZCNrpdi0uwSI8N4Im3NBnc76S1ZBJIUTMkSUZCh4MQk7HqwMBVZCDX8qP8ejoxIQvUCvXhZCeGy2py2bfGbkQukG34DoEEnJGPfGIFj4rizl1o7pejEgEKmGZBzPI4OZB3JR1t1s92lZCP6NX5RtYSm0BU1hyC6i8zBKN1MTndnT3DaykkNqQMJeAZDZD'
        }
      }).then((res) => {
        res.status(200).json(result)
      }).catch((e) => {
        res.status(200).json(result)
      })
    } else {
      res.status(404).json({
        message: 'Not Found'
      })
    }
  }
})

module.exports = router

