module.exports = {
  name: 'Password Recovery',

  description: 'Sends a password reset email',

  body: (name, resetLink) => {
    return `<!DOCTYPE html>
    <html  style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
    <head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <style type="text/css">

    </style>
    </head>
    <body>
      <h1>Password Recovery</h1>
      <p>
        Hi ${name}
        <br>
        We received your request to reset your password.
        <br>
        In order to reset your password you have to click on the button below.
        <br>
      </p>
      <a href="${resetLink}"><button>Reset Password</button></a>
      <p>If you are unable to click on the button, please copy and paste this code into your web browser:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>
        Trip Mate
        <br>
        7, some street
        <br>
        12345, City
        <br>
        <p><a href="mailto: contact@project-zone.com">contact@project-zone.com</a></p>
      </p>
    </body>
    `;
  },
};