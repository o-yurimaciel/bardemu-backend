const str = 'vila nova   ';
const parsed = str.normalize('NFD')
.replace(/[\u0300-\u036f]/g, '')
.split(" ").join("")
.trim()
.toLocaleUpperCase()
console.log(parsed);