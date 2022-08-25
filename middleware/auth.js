const jwt = require('jsonwebtoken')

const config = process.env

const verifyToken = (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers["x-access-token"]

  if(!token) {
    return res.status(401).json({
      message: "Ausência de token de autenticação"
    })
  }

  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY)
    req.user = decoded
  } catch (error) {
    return res.status(401).send("Token de autenticação inválido")
  }

  return next()
}

module.exports = verifyToken