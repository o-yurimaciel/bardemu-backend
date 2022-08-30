const express = require('express')
const router = express.Router()
const { feedbackModel, orderModel } = require('../models')
const mongoose = require('mongoose')
const ObjectId = require('mongoose').Types.ObjectId;
const eventEmitter = require('../eventEmitter')
const auth = require('../middleware/auth')
const verifyRole = require('../middleware/role');
const sensitiveName = require('../utils/sensitiveName');

router.post('/feedback', auth, async (req, res) => {
  try {
    const { orderId, message, rating, userId } = req.body

    const order = await orderModel.findOne({ _id: new ObjectId(orderId) })

    if(!order.userId.equals(new ObjectId(userId))) {
      return res.status(403).json({
        message: 'Operação não permitida'
      })
    }

    if(order) {
      const newFeedback = await new feedbackModel({
        _id: new mongoose.Types.ObjectId(),
        orderId,
        userId,
        name: sensitiveName(order.clientName),
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
    } else {
      res.status(404).json({
        message: "Pedido não encontrado"
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
})

router.get('/feedbacks', auth, verifyRole, async (req, res) => {
  try {
    const feedbacks = await feedbackModel.find()
    
    if(feedbacks) {
      res.status(200).json(feedbacks)
    } else {
      res.status(404).json({
        message: 'Nenhuma avaliação foi encontrada'
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
})

router.get('/feedbacks/favorites', async (req, res) => {
  try {
    const feedbacks = await feedbackModel.find({
      favorite: true
    })
    
    if(feedbacks) {
      feedbacks.filter((feedback) => {
        feedback._id = undefined
        feedback.userId = undefined
        feedback.orderId = undefined
      })

      res.status(200).json(feedbacks)
    } else {
      res.status(404).json({
        message: 'Nenhuma avaliação foi encontrada'
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
})

router.put('/feedback/favorite', auth, verifyRole, async (req, res) => {
  try {
    const { _id, favorite } = req.body

    if(_id) {
      const feedback = await feedbackModel.findOne({ _id: new ObjectId(_id)} )
  
      if(feedback) {
        const result = await feedbackModel.updateOne({
          _id: new ObjectId(_id)
        }, {
          favorite
        }, {
          new: true
        })
  
        res.status(200).json(result)
      } else {
        res.status(404).json({
          message: 'Feedback não encontrado'
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

module.exports = router
