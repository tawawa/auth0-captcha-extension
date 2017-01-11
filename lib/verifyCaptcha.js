import request from 'request';

export default function verifyCaptcha(captchaResponse, secret, ip) {

  return new Promise(function (request, resolve){

    function handleResponse(error, response, body) {
      if (error) {
        reject(error);
      }

      if (response.statusCode !== 200) {
        reject('Error validating captcha: ' + response.statusCode);
      }

      var data = JSON.parse(body);

      if (data.success) {
        resolve(true)
      } else {
        reject("Error from reCaptcha: " + JSON.stringify(data));
      }
    }

    request.post({
      url: 'https://www.google.com/recaptcha/api/siteverify',
      form: {
        response: captchaResponse,
        secret: secret,
        remoteip: ip
      }
    }, handleResponse);

  });

}
