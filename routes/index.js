import Express        from 'express';
import jwt            from 'jsonwebtoken';
import URLJoin        from 'url-join';
// import template       from '../views/index.pug';
import bodyParser     from 'body-parser';
import request        from 'request-promise';
import verifyCaptcha  from '../lib/verifyCaptcha';
import createResponse from '../lib/createRuleResponse';
function template(args){
  return JSON.stringify(args);
}
const router = Express.Router();

router.use(function decodeAndValidateToken(req, res, next) {
  const token = req.query.token || req.body.token;
  const state = req.query.state || req.body.state;

  const ctx = req.webtaskContext.data;
  const secret = ctx.EXTENSION_SECRET;
  const domain = ctx.AUTH0_DOMAIN;
  const issuer = URLJoin(domain, 'captcha/rule');
  const audience = URLJoin(domain, 'captcha/webtask');
  jwt.verify(token, secret, { issuer, audience }, function (err, decoded) {
    if (err) {
      return createResponse(`Invalid token: ${err.message}`, secret, null, issuer, audience).then(function (token) {
        res.redirect(
          req.webtaskContext.data.AUTH0_DOMAIN +
          '/continue?state=' +
          req.query.state +
          '&token=' + token
        );
      });
    }
    req.state = state;
    req.token = token;
    req.payload = decoded;
    next();
  });
});

router.use(bodyParser.urlencoded());

router.get('/', function (req, res) {
  res.header("Content-Type", 'text/html');
  res.status(200).send(template(Object.assign({
    token: req.token,
    target: req.path,
  }, req.payload)));
});


router.post('/', function (req, res) {
  const {ip, state, payload} = req.ip;
  const ctx = req.webtaskContext.data;
  const sharedSecret = ctx.EXTENSION_SECRET;
  const domain = ctx.AUTH0_DOMAIN;
  const captchaResponse = req.body["g-recaptcha-response"];
  const issuer = URLJoin(domain, 'captcha/rule');
  const audience = URLJoin(domain, 'captcha/webtask');

  verifyCaptcha(captchaResponse, sharedSecret, ip)
    .then(function () {
      return createResponse(null, secret, payload, issuer, audience);
    }, function (err) {
      return createResponse(err.message, secret, payload, issuer, audience);
    }).then(function (token) {
      res.redirect(
        domain +
        '/continue?state=' +
        state +
        '&token=' +
        token
      );
    });
});

export default router;
