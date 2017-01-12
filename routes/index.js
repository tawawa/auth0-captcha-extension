import Express                  from 'express';
import jwt                      from 'jsonwebtoken@7.1.9';
import URLJoin                  from 'url-join';
import template                 from '../views/index.pug';
import bodyParser               from 'body-parser';
import request                  from 'request-promise';
import verifyCaptcha            from '../lib/verifyCaptcha';
import createResponse           from '../lib/createRuleResponse';
import addAuth0ManagementClient from '../lib/addAuth0';


function redirectBackToContinue (req, res, token) {
  const ctx = req.webtaskContext.data;
  const domain = ctx.AUTH0_DOMAIN;
  const state = req.state;

  res.redirect(`https://${domain}/continue?state=${state}&token=${token}`);
}

function renderPage(req, res, ctx){
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
}


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

router.use(addAuth0ManagementClient);

router.get('/', function (req, res) {

  const ctx = req.webtaskContext.data;
  const {state, payload} = req;
  const captchaSecret = ctx.CAPTCHA_SECRET;
  const sharedSecret = ctx.EXTENSION_SECRET;
  const domain = `https://${ctx.AUTH0_DOMAIN}`;
  const issuer = URLJoin(domain, 'captcha/rule');
  const audience = URLJoin(domain, 'captcha/webtask');

  /* @TODO: Refactor this mess */
  if (ctx.MAX_ALLOWED_FAILED_ATTEMPTS) {
    return req.auth0.logs.getAll({
	    q: "date: [" + (payload.lastLogin || '*') + " TO *] AND type: (\"f\" OR \"fp\" OR \"fu\") AND user_id: \"" + payload.sub + "\""
    }).then(function(logs){
      if(logs.length > ctx.MAX_ALLOWED_FAILED_ATTEMPTS) {
        renderPage(req, res, ctx);
        return false;
      }
      return createResponse(null, sharedSecret, payload.sub, issuer, audience);
    }).catch(function(e){
      return createResponse(e.message, sharedSecret, payload.sub, issuer, audience)
    }).then(token => token ? redirectBackToContinue(req, res, token):'');
  }

  renderPage(req, res, ctx);
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

  verifyCaptcha(captchaResponse, captchaSecret, ip)
    .then(
      () => createResponse(null, sharedSecret, payload.sub, issuer, audience),
      (err) => createResponse(err.message, sharedSecret, payload.sub, issuer, audience)
    )
    .then((token) => redirectBackToContinue(req, res, token))
    .catch(function (err) {
       console.log(err);
       res.status(500).end('Error validating your code');
    });
});

export default router;
