function sensitiveName(name) {
  const fullName = name.split(' ')
  return fullName[0].concat(" ").concat(fullName.pop().charAt(0).toString().concat('.'))
}

module.exports = sensitiveName