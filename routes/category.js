const express = require('express')
const router = express.Router()
const { categoryModel } = require('../models')
const mongoose = require('mongoose')
const ObjectId = require('mongoose').Types.ObjectId;
const auth = require('../middleware/auth')
const verifyRole = require('../middleware/role')

router.get('/categories', async (req, res) => {
  try {
    let categories
    const onlyActives = req.headers["only-actives"] === 'true' ? true : false

    if(onlyActives) {
      categories = await categoryModel.find({ active: true })
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
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
})

router.get('/category', async (req, res) => {
  try {
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
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
})

router.post('/category', auth, verifyRole, (req, res) => {
  try {
    const category = {
      _id: new mongoose.Types.ObjectId(),
      createdAt: new Date().toISOString(),
      name: req.body.name.trim(),
      order: req.body.order ? req.body.order : 1,
      active: req.body.active ? req.body.active : false
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
        message: 'Erro de validação'
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
})

router.delete('/category', auth, verifyRole, async (req, res) => {
  try {
    const id = new ObjectId(req.body._id)
    const result = await categoryModel.deleteOne({ _id: id })
  
    if(result) {
      res.status(200).json(result)
    } else {
      res.status(500).json({})
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
})

router.put('/category', auth, verifyRole, async (req, res) => {
  try {
    const id = new ObjectId(req.query._id)
  
    const category = {
      name: req.body.name.trim(),
      order: req.body.order,
      updatedAt: new Date().toISOString(),
      active: req.body.active ? req.body.active : false
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
        message: 'Erro de validação'
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
})

module.exports = router