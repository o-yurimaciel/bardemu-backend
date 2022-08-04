const express = require('express')
const router = express.Router()
const { feedbackModel, orderModel } = require('../models')
const mongoose = require('mongoose')
const ObjectId = require('mongoose').Types.ObjectId;

router.post('/feedback', async (req, res) => {
  const { orderId, message, note } = req.body

  const newFeedback = await new feedbackModel({
    _id: new mongoose.Types.ObjectId(),
    orderId,
    createdAt: new Date().toISOString(),
    message: message,
    note: note
  })

  if(newFeedback) {
    newFeedback.save(async function(err) {
      if(err) {
        res.status(400).json(err)
        return
      }

      const findOrder = await orderModel.findOneAndUpdate({
        _id: new ObjectId(orderId)
      }, {
        $push: {
          feedbacks: newFeedback
        }
      })

      if(findOrder) {
        res.status(200).json(newFeedback)
      } else {
        res.status(404).json({
          message: "NotFound"
        })
      }
    })
  }
})

module.exports = router
