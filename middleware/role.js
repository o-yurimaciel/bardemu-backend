const { userModel } = require("../models")
const ObjectId = require('mongoose').Types.ObjectId;

const verifyRole = async (req, res, next) => {
  const id = req.body.userId || req.query.userId || req.headers["x-user-id"]
  const user = await userModel.findOne({ _id: new ObjectId(id)})

  if(user) {
    if(user.role !== "MASTER") {
      return res.status(403).json({
        message: 'Acesso restrito a administradores'
      })
    } else {
      return next()
    }
  } else {
    return res.status(404).json({
      message: 'ID de administrador não encontrado'
    })
  }
}

module.exports = verifyRole