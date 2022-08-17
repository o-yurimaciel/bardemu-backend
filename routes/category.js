const express = require('express')
const router = express.Router()
const { categoryModel } = require('../models')
const mongoose = require('mongoose')
const ObjectId = require('mongoose').Types.ObjectId;
const auth = require('../middleware/auth')

router.get('/categories', async (req, res) => {
  const result = await categoryModel.find()

  if(result) {
    res.status(200).json(result)
  } else {
    res.status(404).json({
      message: 'Not Found'
    })
  }
})

router.get('/category', async (req, res) => {
  const { _id } = req.query

  const result = await categoryModel.findById({
    _id: new ObjectId(_id)
  })

  if(result) {
    res.status(200).json(result)
  } else {
    res.status(404).json({
      message: 'Not Found'
    })
  }
})

router.post('/category', auth, (req, res) => {
  const category = {
    _id: new mongoose.Types.ObjectId(),
    createdAt: new Date().toISOString(),
    name: req.body.name.trim(),
    order: req.body.order ? req.body.order : 1
  }

  if(category.name && category.order) {
    let newCategory = new categoryModel(category)
  
    newCategory.save(function(err) {
      if(err) {
        return res.status(500).json(err)
      }
      res.status(200).json(category)
    })
  } else {
    res.status(400).json({
      message: 'Validation failure'
    })
  }
})

router.delete('/category', auth, async (req, res) => {
  console.log(req.body)
  const id = new ObjectId(req.body._id)
  const result = await categoryModel.deleteOne({ _id: id })

  if(result) {
    res.status(200).json(result)
  } else {
    res.status(500).json({})
  }
})

router.put('/category', auth, async (req, res) => {
  console.log(req.body)
  const id = new ObjectId(req.query._id)

  const category = {
    name: req.body.name.trim(),
    order: req.body.order,
    updatedAt: new Date().toISOString()
  }

  if(category.name && category.order) {
    const result = await categoryModel.findOneAndReplace({
      _id: id
    }, category)
  
    if(result) {
      res.status(200).json(category)
    } else {
      res.status(500).json({})
    }
  } else {
    res.status(400).json({
      message: 'Validation failure'
    })
  }
})

module.exports = router