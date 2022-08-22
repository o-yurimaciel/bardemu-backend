const express = require('express')
const router = express.Router()
const { configsModel } = require('../models')

router.get('/configs', async (req, res) => {
  try {
    const result = await configsModel.find()
    if(result) {
      res.status(200).json(result[0])
    } else {
      res.status(404).json({
        message: "Não encontrado"
      })
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

module.exports = router