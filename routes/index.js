import Express        from 'express';
import jwt            from 'jsonwebtoken@7.1.9';
import URLJoin        from 'url-join';
import template       from '../views/index.pug';
import bodyParser     from 'body-parser';
import request        from 'request-promise';
import verifyCaptcha  from '../lib/verifyCaptcha';
import createResponse from '../lib/createRuleResponse';

const router = Express.Router();

router.use(bodyParser.urlencoded({
  extended: true
}));

router.use(function decodeAndValidateToken(req, res, next) {

  const params = (req.body && req.body.token)?req.body:req.query;
  const token = params.token;
  const state = params.state;

  const ctx = req.webtaskContext.data;
  const secret = ctx.EXTENSION_SECRET;
  const domain = `https://${ctx.AUTH0_DOMAIN}`;
  const issuer = URLJoin(domain, 'captcha/rule');
  const audience = URLJoin(domain, 'captcha/webtask');


  jwt.verify(token, secret, { issuer, audience }, function (err, decoded) {

    if (err) {
      return createResponse(`Invalid token: ${err.message}`, secret, null, issuer, audience)
        .then(function (token) {
          res.redirect(
            domain +
            '/continue?state=' +
            state +
            '&token=' +
            token
          );
        });
    }

    req.payload = decoded;
    req.state = state;
    req.token = token;
    next();

  });
});


router.get('/', function (req, res) {
  const ctx = req.webtaskContext.data;
  res.header("Content-Type", 'text/html');
  res.status(200).send(template(Object.assign({
    style: ctx.STYLES,
    message: ctx.CAPTCHA_MESSAGE,
    apiKey: ctx.CAPTCHA_SITEKEY,
    title: ctx.CAPTCHA_TITLE,
    target: ctx.WT_URL,
    token: req.token,
    state: req.state
  }, req.payload)));
});


router.post('/', function (req, res) {
  console.log("Recieved post");
  const {ip, state, payload} = req;
  const ctx = req.webtaskContext.data;
  const captchaSecret = ctx.CAPTCHA_SECRET;
  const sharedSecret = ctx.EXTENSION_SECRET;
  const domain = `https://${ctx.AUTH0_DOMAIN}`;
  const captchaResponse = req.body["g-recaptcha-response"];
  const issuer = URLJoin(domain, 'captcha/rule');
  const audience = URLJoin(domain, 'captcha/webtask');

  console.log("verifying captcha response", sharedSecret, ip, captchaResponse);

  verifyCaptcha(captchaResponse, captchaSecret, ip)
    .then(function () {
      console.log("Verified now create Response");
      return createResponse(null, sharedSecret, payload.sub, issuer, audience);
    }, function (err) {
      console.log("Failed now create Response");
      return createResponse(err.message, sharedSecret, payload.sub, issuer, audience);
    }).then(function (token) {
      console.log("Forged token");
      res.redirect(
        domain +
        '/continue?state=' +
        state +
        '&token=' +
        token
      );
    }).catch(function (err) {
      console.log(err);
      res.status(500).end('Error validating your code');
    });
});

export default router;
