const express = require('express')
const router = express.Router()
const { categoryModel } = require('../models')
const ObjectId = require('mongoose').Types.ObjectId; 

router.get('/category', async (req, res) => {
  let categories;

  if(req.query && req.query._id) {
    const id = new ObjectId(req.query._id)
    categories = await categoryModel.findById(id)
  } else {
    categories = await categoryModel.find()
  }

  if(categories) {
    res.status(200).json(categories)
  } else {
    res.status(404).json({
      message: 'Not Found'
    })
  }
})

router.post('/category', (req, res) => {
  const category = {
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    order: req.body.order ? req.body.order : 1
  }

  if(category.name && category.order) {
    let newCategory = new categoryModel(category)
  
    newCategory.save(function(err) {
      console.log(err)
      res.status(200).json(category)
    })
  } else {
    res.status(400).json({
      message: 'Validation failure',
      body: req.body
    })
  }
})

router.delete('/category', async (req, res) => {
  console.log(req.body)
  const id = new ObjectId(req.body._id)
  const result = await categoryModel.deleteOne({ _id: id })

  if(result) {
    res.status(200).json({})
  } else {
    res.status(500).json({})
  }
})

router.put('/category', async (req, res) => {
  console.log(req.body)
  const id = new ObjectId(req.query._id)

  const category = {
    name: req.body.name,
    order: req.body.order
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
      message: 'Validation failure',
      body: req.body
    })
  }
})

module.exports = router