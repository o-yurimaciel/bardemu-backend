var nodemailer = require('nodemailer');

module.exports = function sendEmail({ to, subject, text }) {
  var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    service: 'gmail',
    auth: {
      user: 'bardemurilo@gmail.com',
      pass: 'svprxmbtaonzwcop'
    }
  });

  // var mailOptions = {
  //   from: 'bardemurilo@gmail.com',
  //   to: 'brendabalbuenods@gmail.com',
  //   subject: 'BarDeMu Lanches - Código de redefinição de senha',
  //   text: 'Olá, o seu código de redefinição de senha é: \njvBE849K'
  // };

  var mailOptions = {
    from: 'bardemurilo@gmail.com',
    to,
    subject,
    text
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}