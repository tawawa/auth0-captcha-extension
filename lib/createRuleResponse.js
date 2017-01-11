import jwt from 'jsonwebtoken';

export default function createRuleResponse(err, secret, subject, audience, issuer) {
  return new Promise(function (resolve, reject) {
    const payload = {
      captchaOk: err === null,
      sub: subject,
      errorMessage: err
    };

    const header = {
      expiresIn: "2m",
      audience,
      issuer
    };

    jwt.sign(payload, secret, header, function (err, token) {
      if (err) return reject(err);
      resolve(token);
    });
  });

}
