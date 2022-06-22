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

  res.status(200).json(categories)
})

router.post('/category', (req, res) => {
  const category = {
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    order: req.body.order ? req.body.order : 1
  }

  let newCategory = new categoryModel(category)

  newCategory.save(function(err) {
    console.log(err)
    res.status(200).json(category)
  })
})

router.delete('/category', async (req, res) => {
  console.log(req.body)
  const id = new ObjectId(req.body._id)
  await categoryModel.deleteOne({ _id: id })
  res.status(200).json({})
})

router.put('/category', async (req, res) => {
  console.log(req.body)
  const id = new ObjectId(req.query._id)

  await categoryModel.findOneAndReplace({
    _id: id
  }, req.body)

  res.status(200).json(req.body)
})

module.exports = router