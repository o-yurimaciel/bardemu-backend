const express = require('express')
const router = express.Router()
const { orderModel } = require('../models')
const ObjectId = require('mongoose').Types.ObjectId;
const mongoose = require('mongoose');
const eventEmitter = require('../eventEmitter')

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
    clientAddressData,
    paymentType, 
    cashChange, 
    cardFlag,
    products
  } = req.body

  const orderStatus = "PENDING"

  const newOrder = new orderModel({
    _id: new mongoose.Types.ObjectId(),
    createdAt: new Date().toISOString(),
    orderStatus,
    totalValue,
    products,
    clientName,
    clientPhone,
    clientAddress,
    clientAddressData,
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
    ],
    deliveryId: clientPhone ? clientPhone.slice(clientPhone.length - 4) : null
  })

  newOrder.save(function(err) {
    if(err) {
      res.status(400).json(err)
      return
    }
    eventEmitter.emit('wss-broadcast', Object.assign({ type: 'order'}, newOrder))
    res.status(200).json(newOrder)
  })
})

router.put('/order', async (req, res) => {
  const { _id } = req.query
  const { orderStatus, estimatedTime } = req.body

  const order = await orderModel.findOne({
    _id: _id
  })

  const validStatusOptions = [
    "CONFIRMED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED"
  ]

  const isValidStatus = validStatusOptions.some((status) => status === orderStatus)

  if(!isValidStatus) {
    res.status(400).json({
      message: 'Invalid status',
      options: validStatusOptions
    })
    return    
  }

  const statusAlreadyExist = order.orderStatusHistory.some((history) => history.status === orderStatus)

  if(statusAlreadyExist) {
    res.status(400).json({
      message: `Duplicated status`,
      order: order
    })
    return
  }

  let message = null

  switch(orderStatus) {
    case "CONFIRMED":
      if(estimatedTime) {
        message = `Olá, ${order.clientName}.\nO seu pedido foi confirmado e já está sendo preparado.\nA previsão de entrega é de ${estimatedTime} minutos.\n\nVocê será avisado quando o pedido sair para a entrega.\nBarDeMu agradece a preferência. :)`
      } else {
        res.status(400).json({
          message: 'invalid estimatedTime'
        })
        return 
      }
      break
    case "OUT_FOR_DELIVERY":
      message = `O seu pedido acabou de sair para entrega.\nPor favor, informe o código "${order.deliveryId}" ao motoboy para receber.`
      break
    case "DELIVERED":
      message = `O seu pedido foi entregue.\nAvalie a sua experiência aqui -> https://bardemu.com.br/pedido/${order._id}`
      break
    case "CANCELLED":
      message = `Olá, ${order.clientName}! O seu pedido foi cancelado.`
      break
  }

  const result = await orderModel.findOneAndUpdate({
    _id: new ObjectId(_id)
  }, {
    orderStatus,
    estimatedTime,
    message,
    updatedAt: new Date().toISOString(),
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
    res.status(200).json(result)
      // axios.post(`https://graph.facebook.com/v13.0/${process.env.WHATSAPP_CLIENT_ID}/messages`, {
    //   messaging_product: "whatsapp",
    //   to: order.clientPhone.replace(/[^0-9]/g, ''),
    //   type: "text",
    //   text: {
    //     preview_url: false,
    //     body: message
    //   }
    // }, {
    //   headers: {
    //     Authorization: process.env.WHATSAPP_TOKEN
    //   }
    // }).then((res) => {
    //   console.log(res)
    //   res.status(200).json(result)
    // }).catch((e) => {
    //   console.log(e.response)
    //   res.status(200).json(result)
    // })
  } else {
    res.status(404).json({
      message: 'Not Found'
    })
  }
})

module.exports = router

