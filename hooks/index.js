import express          from 'express';
import Request          from 'request';
import auth0            from 'auth0@2.1.0';
import jwt              from 'jsonwebtoken@7.1.9';
import URLJoin          from 'url-join';
import createRule       from '../rules/check-captcha.js';

function findRule(rules, name){
  return rules.filter(function(rule){
    return rule.name === name;
  })[0];
}

const ManagementClient = auth0.ManagementClient;
const hooks            = express.Router();

/*
 * Accepts a string path and returns an Express.Middleware
 * which verifies if the audience for jwt included that path
 * along with the issuer etc.
 */
function createRuleValidator (path) {
  return function (req, res, next) {

    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      var token = req.headers.authorization.split(' ')[1];
      return jwt.verify(token, req.webtaskContext.data.EXTENSION_SECRET, {
        audience: URLJoin(req.webtaskContext.data.WT_URL, path),
        issuer: 'https://' + req.webtaskContext.data.AUTH0_DOMAIN
      }, function (err, decoded){
        if (err) {
          return res.sendStatus(401);
        }
        return next();
      });
    }

    return res.sendStatus(401);
  }
}

// Validate JWT for on-install
hooks.use('/on-install', createRuleValidator('/.extensions/on-install'));
hooks.use('/on-uninstall', createRuleValidator('/.extensions/on-uninstall'));
hooks.use('/on-update', createRuleValidator('/.extensions/on-update'));

// Getting Auth0 APIV2 access_token
hooks.use(function (req, res, next) {
  getToken(req).then(function (accessToken) {
    var management = new ManagementClient({
      domain: req.webtaskContext.data.AUTH0_DOMAIN,
      token: accessToken
    });
    req.auth0 = management;
    next();
  }).catch(next);
});

/* To check everything */
hooks.get('/', function (a,b) {
  b.status(200).end('Ok');
});

// This endpoint would be called by webtask-gallery
hooks.post('/on-install', function (req, res) {
  const ctx = req.webtaskContext.data;

  req.auth0.rules.create({
    name: 'captcha-rule-PLEASE-DO-NOT-RENAME',
    script: createRule({
      MAX_ALLOWED_FAILED_ATTEMPTS: parseInt(ctx.MAX_ALLOWED_FAILED_ATTEMPTS, 10) || 0,
      EXTENSION_SECRET: ctx.EXTENSION_SECRET,
      CAPTCHA_URL: ctx.WT_URL
    }),
    order: 2,
    enabled: true,
    stage: "login_success"
  })
  .then(function () {
    res.sendStatus(204);
  })
  .catch(function (e) {
    res.sendStatus(500);
  });
});

// This endpoint would be called by webtask-gallery
hooks.put('/on-update', function (req, res) {
  res.sendStatus(204);
});

// This endpoint would be called by webtask-gallery
hooks.delete('/on-uninstall', function (req, res) {
  req.auth0
    .rules.getAll()
    .then(function (rules) {
      var rule = findRule(rules, 'captcha-rule-PLEASE-DO-NOT-RENAME');

      if (rule) {
        req.auth0
          .rules.delete({ id: rule.id })
          .then(function () {
            res.sendStatus(204);
          })
          .catch(function () {
            res.sendStatus(500);
          });
      }
    })
    .catch(function () {
      res.sendStatus(500);
    });
});

function getToken(req, cb) {
  const ctx = req.webtaskContext.data;
  const domain = ctx.AUTH0_DOMAIN;


  var apiUrl = `https://${domain}/oauth/token`;
  var audience = `https://${domain}/api/v2/`;
  var clientSecret = ctx.AUTH0_CLIENT_SECRET;
  var clientId = ctx.AUTH0_CLIENT_ID;

  return new Promise(function (resolve, reject){
    const config = {
      body: {
        audience: audience,
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
      },
      json: true
    };

    Request.post(apiUrl, config, function (err, response, body) {
      if(err) return reject(err);
      resolve(body.access_token);
    });
  });
}

export default hooks;
