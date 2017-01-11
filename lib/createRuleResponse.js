import jwt from 'jsonwebtoken';

export default function createRuleResponse(err, secret, subject, audience, issuer) {
  return new Promise(function (resolve, reject) {
    const payload = {
      captchaOk: err === null,
      sub: subject,
      errorMessage: err
    };

    const header = {
      expiresInMinutes: 2,
      audience: getRuleUri(req),
      issuer: getWtUri(req)
    };

    jwt.sign(payload, secret, header, function (err, token) {
      if (err) return reject(err);
      resolve(token);
    });
  });

}
