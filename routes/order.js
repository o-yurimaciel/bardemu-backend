const express = require('express')
const router = express.Router()
const { orderModel, userModel } = require('../models')
const ObjectId = require('mongoose').Types.ObjectId;
const mongoose = require('mongoose');
const eventEmitter = require('../eventEmitter')
const auth = require('../middleware/auth')

router.get('/orders', auth, async (req, res) => {
  const result = await orderModel.find()

  if(result) {
    res.status(200).json(result)
  } else {
    res.status(404).json({
      message: "Nenhum pedido foi encontrado"
    })
  }
})

router.get('/user/orders', auth, async (req, res) => {
  const { userId } = req.query

  const result = await orderModel.find({ userId })

  if(result) {
    res.status(200).json(result)
  } else {
    res.status(404).json({
      message: "Nenhum pedido foi encontrado"
    })
  }
})

router.get('/order', auth, async (req, res) => {
  const { _id } = req.query

  if(_id) {
    const result = await orderModel.findOne({
      _id: new ObjectId(_id)
    })
  
    if(result) {
      res.status(200).json(result)
    } else {
      res.status(404).json({
        message: 'Pedido não encontrado'
      })
    }
  } else {
    res.status(400).json({
      message: 'Erro de validação'
    })
  }
})

router.post('/order', auth, async (req, res) => {
  const { 
    totalValue,
    paymentType, 
    cashChange, 
    cardFlag,
    products,
    userId,
    clientAddress,
    clientAddressName,
    clientAddressData,
    clientAddressNumber
  } = req.body

  const orderStatus = "PENDING"
  const id = new ObjectId(userId) 
  const user = await userModel.findOne({ _id: id })

  if(user) {
    const newOrder = await new orderModel({
      _id: new mongoose.Types.ObjectId(),
      createdAt: new Date().toISOString(),
      orderStatus,
      totalValue,
      products,
      clientName: user.firstName.concat(" ").concat(user.lastName),
      clientPhone: user.phone,
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
      deliveryId: user.phone ? user.phone.slice(user.phone.length - 4) : null,
      userId: id
    })
  
    newOrder.save(function(err) {
      if(err) {
        res.status(400).json(err)
        return
      }
      eventEmitter.emit('wss-broadcast', Object.assign({ type: 'order'}, newOrder))
      res.status(200).json(newOrder)
    })
  } else {
    res.status(404).json({
      message: "Usuário não encontrado"
    })
  }
})

router.put('/order', auth, async (req, res) => {
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
      message: 'Status de pedido inválido',
      options: validStatusOptions
    })
    return    
  }

  const statusAlreadyExist = order.orderStatusHistory.some((history) => history.status === orderStatus)

  if(statusAlreadyExist) {
    res.status(400).json({
      message: `Status duplicado`,
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
          message: 'Tempo estimado de entrega inválido'
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
  } else {
    res.status(404).json({
      message: 'Pedido não encontrado'
    })
  }
})

module.exports = router

