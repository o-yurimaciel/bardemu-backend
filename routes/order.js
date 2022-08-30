const express = require('express')
const router = express.Router()
const { orderModel, userModel } = require('../models')
const ObjectId = require('mongoose').Types.ObjectId;
const mongoose = require('mongoose');
const eventEmitter = require('../eventEmitter')
const auth = require('../middleware/auth')
const verifyRole = require('../middleware/role')
const sendEmail = require('../utils/email');

router.get('/orders', auth, verifyRole, async (req, res) => {
  try {
    const result = await orderModel.find()
  
    if(result) {
      res.status(200).json(result)
    } else {
      res.status(404).json({
        message: "Nenhum pedido foi encontrado"
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
})

router.get('/user/orders', auth, async (req, res) => {
  try {
    const { userId } = req.query
  
    const result = await orderModel.find({ userId })
  
    if(result) {
      res.status(200).json(result)
    } else {
      res.status(404).json({
        message: "Nenhum pedido foi encontrado"
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
})

router.get('/order', auth, async (req, res) => {
  try {
    const { _id, userId } = req.query
  
    if(_id && userId) {
      const user = await userModel.findOne({ _id: new ObjectId(userId) })

      if(user) {
        const order = await orderModel.findOne({
          _id: new ObjectId(_id)
        })

        if(user.role !== "MASTER" && !user._id.equals(order.userId)) {
          return res.status(403).json({
            message: 'Operação não permitida'
          })
        }
      
        if(order) {
          res.status(200).json(order)
        } else {
          res.status(404).json({
            message: 'Pedido não encontrado'
          })
        }
      } else {
        res.status(404).json({
          message: 'Usuário não encontrado'
        })
      }
    } else {
      res.status(400).json({
        message: 'Erro de validação'
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
})

router.post('/order', auth, async (req, res) => {
  try { 
    const { 
      paymentType, 
      cashChange, 
      cardFlag,
      products,
      userId,
      clientAddress,
      clientAddressName,
      clientAddressData,
      clientAddressNumber,
      deliveryPrice,
      orderValue,
      coupon,
      discountValue
    } = req.body

    let orderNumber = await orderModel.count()
    orderNumber = orderNumber + 1
  
    const orderStatus = "PENDING"
    const id = new ObjectId(userId) 
    const user = await userModel.findOne({ _id: id })
    const totalValue = parseFloat(orderValue) + parseFloat(deliveryPrice) - parseFloat(discountValue)
  
    if(user) {
      const newOrder = await new orderModel({
        _id: new mongoose.Types.ObjectId(),
        orderNumber: orderNumber,
        createdAt: new Date().toISOString(),
        orderStatus,
        totalValue,
        products,
        clientName: user.fullName,
        clientPhone: user.phone,
        clientAddress,
        clientAddressData,
        clientAddressName,
        clientAddressNumber,
        paymentType,
        cashChange,
        deliveryPrice,
        cardFlag,
        orderStatusHistory: [
          {
            status: orderStatus,
            date: new Date().toISOString()
          }
        ],
        deliveryId: user.phone ? user.phone.slice(user.phone.length - 4) : null,
        userId: id,
        orderValue,
        coupon,
        discountValue
      })
    
      newOrder.save(function(err) {
        if(err) {
          res.status(400).json(err)
          return
        }
        eventEmitter.emit('wss-broadcast', Object.assign({ type: 'order'}, newOrder))
        sendEmail({
          to: user.email,
          subject: `BarDeMu Lanches - Pedido #${orderNumber} realizado`,
          text: `
          Olá, ${user.firstName}.\nO seu pedido foi realizado e está aguardando confirmação.\nVocê será atualizado via WhatsApp sobre o andamento do pedido e também pode acompanhar pelo site em www.bardemu.com.br/meus-pedidos\nFique à vontade para nos chamar para quaisquer dúvidas ou alterações do pedido.\nBarDeMu agradece a preferência. :)`
        })
        res.status(200).json(newOrder)
      })
    } else {
      res.status(404).json({
        message: "Usuário não encontrado"
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
})

router.put('/order', auth, verifyRole, async (req, res) => {
  try {
    const { _id } = req.query
    const { orderStatus, estimatedTime } = req.body
  
    const order = await orderModel.findOne({
      _id: new ObjectId(_id)
    })

    const user = await userModel.findOne({
      _id: new ObjectId(order.userId)
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
    let subject = null
  
    switch(orderStatus) {
      case "CONFIRMED":
        if(estimatedTime || estimatedTime <= 0) {
          subject = `BarDeMu Lanches - Pedido #${order.orderNumber} confirmado`
          message = `Olá, ${order.clientName}.\nO seu pedido foi confirmado e já está sendo preparado.\nA previsão de entrega é de ${estimatedTime} minutos.\n\nVocê será avisado quando o pedido sair para a entrega.`
        } else {
          res.status(400).json({
            message: 'Tempo estimado de entrega inválido'
          })
          return 
        }
        break
      case "OUT_FOR_DELIVERY":
        subject = `BarDeMu Lanches - Pedido #${order.orderNumber} saiu para entrega`
        message = `O seu pedido acabou de sair para entrega.\nPor favor, informe o código "${order.deliveryId}" ao entregador para receber.`
        break
      case "DELIVERED":
        subject = `BarDeMu Lanches - Pedido #${order.orderNumber} entregue`
        message = `O seu pedido foi entregue.\nAvalie a sua experiência aqui -> https://bardemu.com.br/pedido/${order._id}\nMuito obrigado e volte sempre!`
        break
      case "CANCELLED":
        subject = `BarDeMu Lanches - Pedido #${order.orderNumber} cancelado`
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
      if(user.email) {
        sendEmail({
          to: user.email,
          subject: subject,
          text: message
        })
      }
      res.status(200).json(result)
    } else {
      res.status(404).json({
        message: 'Pedido não encontrado'
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
})

module.exports = router

