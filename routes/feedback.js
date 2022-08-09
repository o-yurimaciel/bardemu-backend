const express = require('express')
const router = express.Router()
const { feedbackModel, orderModel } = require('../models')
const mongoose = require('mongoose')
const ObjectId = require('mongoose').Types.ObjectId;
const eventEmitter = require('../eventEmitter')

router.post('/feedback', async (req, res) => {
  const { orderId, message, rating } = req.body

  const newFeedback = await new feedbackModel({
    _id: new mongoose.Types.ObjectId(),
    orderId,
    createdAt: new Date().toISOString(),
    message,
    rating
  })

  if(newFeedback) {
    newFeedback.save(async function(err) {
      if(err) {
        res.status(400).json(err)
        return
      }

      const order = await orderModel.findOneAndUpdate({
        _id: new ObjectId(orderId)
      }, {
        feedback: newFeedback
      })

      if(order) {
        if(!order.feedback) {
          eventEmitter.emit('wss-broadcast', Object.assign({ type: 'feedback'}, newFeedback))
          res.status(200).json(newFeedback)
        } else {
          res.status(400).json({
            message: "Um feedback já foi registrado no pedido"
          })
        }
      } else {
        res.status(404).json({
          message: "Pedido não encontrado"
        })
      }
    })
  }
})

module.exports = router
