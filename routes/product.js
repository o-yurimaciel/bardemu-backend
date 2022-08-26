const express = require('express')
const router = express.Router()
const { productModel, categoryModel } = require('../models')
const ObjectId = require('mongoose').Types.ObjectId;
const mongoose = require('mongoose');
const auth = require('../middleware/auth')
const verifyRole = require('../middleware/role')

router.get('/products', async (req, res) => {
  try {
    let products;

    const withouImages = req.headers["without-images"] === 'true' ? true : false
    const onlyActives = req.headers["only-actives"] === 'true' ? true : false

    if(withouImages) {
      products = await productModel.find().select(['-image'])
    } else if(onlyActives) {
      products = await productModel.find({ active: true })
    } else {
      products = await productModel.find()
    }

    if(products) {
      res.status(200).json(products)
    } else {
      res.status(404).json({
        message: 'Nenhum produto foi encontrado'
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
})

router.get('/product', async (req, res) => {
  try {
    const { _id } = req.query
  
    if(_id) {
      const result = await productModel.findOne({
        _id: new ObjectId(_id)
      })
    
      if(result) {
        res.status(200).json(result)
      } else {
        res.status(404).json({
          message: 'Produto não encontrado'
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

router.post('/product', auth, verifyRole, (req, res) => {
  try { 
    const product = {
      _id: new mongoose.Types.ObjectId(),
      createdAt: new Date().toISOString(),
      name: req.body.name.trim(),
      description: req.body.description ? req.body.description.trim() : '',
      price: req.body.price ? req.body.price : 0,
      image: req.body.image ? req.body.image : null,
      category: req.body.category,
      active: req.body.active ? req.body.active : false
    }
  
    if(product.name && product.price && product.category) {
      let newProduct = new productModel(product)
  
      const category = categoryModel.findOne({
        name: product.category
      })
  
      if(category) {
        newProduct.save(function(err) {
          if(err) {
            res.status(500).json(err)
          }
          res.status(200).json(product)
        })
      } else {
        res.status(404).json({
          message: 'Categoria não encontrada'
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

router.delete('/product', auth, verifyRole, async (req, res) => {
  try {
    const id = new ObjectId(req.body._id)
  
    if(id) {
      const result = await productModel.deleteOne({ _id: id })
      if(result) {
        res.status(200).json({})
      } else {
        res.status(404).json({
          message: 'Produto não encontrado'
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

router.put('/product', auth, verifyRole, async (req, res) => {
  try {
    const id = new ObjectId(req.query._id)
  
    if(id) {
      const result = await productModel.findOneAndReplace({
        _id: id
      }, Object.assign(req.body, {
        updatedAt: new Date().toISOString()
      }))
  
      if(result) {
        res.status(200).json(result)
      } else {
        res.status(404).json({
          message: 'Produto não encontrado'
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