const express = require('express')
const router = express.Router()
const { couponsModel } = require('../models')
const auth = require('../middleware/auth')
const verifyRole = require('../middleware/role')
const ObjectId = require('mongoose').Types.ObjectId;

router.get('/coupon', auth, async (req, res) => {
  try {
    const { name } = req.query
  
    if(name) {
      const coupon = await couponsModel.findOne({ name: name.toLocaleUpperCase().trim() })
  
      if(coupon) {
        res.status(200).json(coupon)
      } else {
        res.status(404).json({
          message: 'Cupom não encontrado'
        })
      }
    } else {
      res.status(400).json({
        message: 'Erro de validação'
      })
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

router.put('/coupon', auth, verifyRole, async (req, res) => {
  try {
    const { _id, name, percent, field, active } = req.body
  
    if(_id && name && percent && field) {
      const coupon = await couponsModel.findOne({ _id: new ObjectId(_id) })
    
      if(coupon) {
        const result = await couponsModel.findOneAndUpdate({
          _id
        }, {
          name,
          percent,
          field,
          active: active ? active : false
        }, {
          new: true
        })
    
        if(result) {
          res.status(200).json(result)
        }
      } else {
        res.status(404).json({
          message: 'Cupom não encontrado'
        })
      }
    } else {
      res.status(400).json({
        message: 'Erro de validação'
      })
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

router.post('/coupon', auth, verifyRole, async (req, res) => {
  try {
    const { name, percent, field, active } = req.body

    if(name && percent && field) {
      const coupon = await couponsModel.findOne({ name })

      if(!coupon) {
        const result = await couponsModel.create({
          name: name.toLocaleUpperCase().trim(),
          percent,
          field,
          active: active ? active : false
        })
        if(result) {
          res.status(201).json(result)
        } else {
          res.status(400).json({
            message: 'Erro de validação'
          })
        }
      } else {
        res.status(409).json({
          message: 'Cupom existente'
        })
      }
    } else {
      res.status(400).json({
        message: 'Erro de validação'
      })
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

router.delete('/coupon', auth, verifyRole, async (req, res) => {
  try {
    const id = new ObjectId(req.body._id)
    const result = await couponsModel.deleteOne({ _id: id })
  
    if(result) {
      res.status(200).json(result)
    } else {
      res.status(500).json({})
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

module.exports = router