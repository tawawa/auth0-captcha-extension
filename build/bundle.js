module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _webtaskTools = __webpack_require__(1);

	var _webtaskTools2 = _interopRequireDefault(_webtaskTools);

	var _index = __webpack_require__(4);

	var _index2 = _interopRequireDefault(_index);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// This is the entry-point for the Webpack build. We need to convert our module
	// (which is a simple Express server) into a Webtask-compatible function.
	module.exports = _webtaskTools2.default.fromExpress(_index2.default);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.fromConnect = exports.fromExpress = fromConnect;
	exports.fromHapi = fromHapi;
	exports.fromServer = exports.fromRestify = fromServer;

	// API functions

	function fromConnect(connectFn) {
	    return function (context, req, res) {
	        var normalizeRouteRx = createRouteNormalizationRx(req.x_wt.jtn);

	        req.originalUrl = req.url;
	        req.url = req.url.replace(normalizeRouteRx, '/');
	        req.webtaskContext = attachStorageHelpers(context);

	        return connectFn(req, res);
	    };
	}

	function fromHapi(server) {
	    var webtaskContext;

	    server.ext('onRequest', function (request, response) {
	        var normalizeRouteRx = createRouteNormalizationRx(request.x_wt.jtn);

	        request.setUrl(request.url.replace(normalizeRouteRx, '/'));
	        request.webtaskContext = webtaskContext;
	    });

	    return function (context, req, res) {
	        var dispatchFn = server._dispatch();

	        webtaskContext = attachStorageHelpers(context);

	        dispatchFn(req, res);
	    };
	}

	function fromServer(httpServer) {
	    return function (context, req, res) {
	        var normalizeRouteRx = createRouteNormalizationRx(req.x_wt.jtn);

	        req.originalUrl = req.url;
	        req.url = req.url.replace(normalizeRouteRx, '/');
	        req.webtaskContext = attachStorageHelpers(context);

	        return httpServer.emit('request', req, res);
	    };
	}

	// Helper functions

	function createRouteNormalizationRx(jtn) {
	    var normalizeRouteBase = '^\/api\/run\/[^\/]+\/';
	    var normalizeNamedRoute = '(?:[^\/\?#]*\/?)?';

	    return new RegExp(normalizeRouteBase + (jtn ? normalizeNamedRoute : ''));
	}

	function attachStorageHelpers(context) {
	    context.read = context.secrets.EXT_STORAGE_URL ? readFromPath : readNotAvailable;
	    context.write = context.secrets.EXT_STORAGE_URL ? writeToPath : writeNotAvailable;

	    return context;

	    function readNotAvailable(path, options, cb) {
	        var Boom = __webpack_require__(2);

	        if (typeof options === 'function') {
	            cb = options;
	            options = {};
	        }

	        cb(Boom.preconditionFailed('Storage is not available in this context'));
	    }

	    function readFromPath(path, options, cb) {
	        var Boom = __webpack_require__(2);
	        var Request = __webpack_require__(3);

	        if (typeof options === 'function') {
	            cb = options;
	            options = {};
	        }

	        Request({
	            uri: context.secrets.EXT_STORAGE_URL,
	            method: 'GET',
	            headers: options.headers || {},
	            qs: { path: path },
	            json: true
	        }, function (err, res, body) {
	            if (err) return cb(Boom.wrap(err, 502));
	            if (res.statusCode === 404 && Object.hasOwnProperty.call(options, 'defaultValue')) return cb(null, options.defaultValue);
	            if (res.statusCode >= 400) return cb(Boom.create(res.statusCode, body && body.message));

	            cb(null, body);
	        });
	    }

	    function writeNotAvailable(path, data, options, cb) {
	        var Boom = __webpack_require__(2);

	        if (typeof options === 'function') {
	            cb = options;
	            options = {};
	        }

	        cb(Boom.preconditionFailed('Storage is not available in this context'));
	    }

	    function writeToPath(path, data, options, cb) {
	        var Boom = __webpack_require__(2);
	        var Request = __webpack_require__(3);

	        if (typeof options === 'function') {
	            cb = options;
	            options = {};
	        }

	        Request({
	            uri: context.secrets.EXT_STORAGE_URL,
	            method: 'PUT',
	            headers: options.headers || {},
	            qs: { path: path },
	            body: data
	        }, function (err, res, body) {
	            if (err) return cb(Boom.wrap(err, 502));
	            if (res.statusCode >= 400) return cb(Boom.create(res.statusCode, body && body.message));

	            cb(null);
	        });
	    }
	}

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("boom");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("request");

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _express = __webpack_require__(5);

	var _express2 = _interopRequireDefault(_express);

	var _webtask = __webpack_require__(6);

	var _webtask2 = _interopRequireDefault(_webtask);

	var _auth0Oauth2Express = __webpack_require__(7);

	var _auth0Oauth2Express2 = _interopRequireDefault(_auth0Oauth2Express);

	var _routes = __webpack_require__(16);

	var _routes2 = _interopRequireDefault(_routes);

	var _hooks = __webpack_require__(24);

	var _hooks2 = _interopRequireDefault(_hooks);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var app = (0, _express2.default)();

	app.use('/.extensions', _hooks2.default);
	app.use(_routes2.default);

	app.use(function (err, req, res, next) {
	  console.log(err);
	  return res.status(501).end('Internal Server Error');
	});

	exports.default = app;

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("express");

/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";

	module.exports = {
		"title": "Captcha Extension",
		"name": "captcha-extension",
		"version": "0.1.0",
		"author": "abhishek.hingikar@auth0.com",
		"description": "An extension that uses Google's ReCaptcha",
		"type": "application",
		"keywords": ["auth0"],
		"auth0": {
			"createClient": true,
			"scopes": "create:rules read:rules delete:rules",
			"onInstallPath": "/.extensions/on-install",
			"onUninstallPath": "/.extensions/on-uninstall",
			"onUpdatePath": "/.extensions/on-update"
		}
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var express = __webpack_require__(5);
	var jade = __webpack_require__(8);
	var expressJwt = __webpack_require__(9);
	var url = __webpack_require__(10);
	var rsaValidation = __webpack_require__(11);
	var bodyParser = __webpack_require__(12);
	var jwt = __webpack_require__(13);
	var request = __webpack_require__(14);

	var getClass = {}.toString;
	function isFunction(object) {
	  return object && getClass.call(object) == '[object Function]';
	}

	function fetchUserInfo(rootTenantAuthority) {
	  return function (req, res, next) {
	    request.get(rootTenantAuthority + '/userinfo').set('Authorization', 'Bearer ' + req.body.access_token).end(function (err, userInfo) {
	      if (err) {
	        res.redirect(res.locals.baseUrl);
	        return;
	      }

	      req.userInfo = userInfo.body;

	      next();
	    });
	  };
	}

	function generateApiToken(secretParam, expiresIn) {
	  return function (req, res, next) {
	    var secret = secretParam;
	    if (isFunction(secretParam)) {
	      secret = secretParam(req);
	    }

	    req.apiToken = jwt.sign(req.userInfo, secret, {
	      algorithm: 'HS256',
	      issuer: res.locals.baseUrl,
	      expiresIn: expiresIn
	    });

	    delete req.userinfo;
	    next();
	  };
	}

	function getUnAuthorizedTemplate(req, res) {
	  var template = ['html', '  head', '    script.', '      window.location.href = \'#{returnTo}\';', '  body'].join('\n');
	  var content = jade.compile(template)({
	    returnTo: req.query && req.query.returnTo ? req.query.returnTo : res.locals.baseUrl
	  });

	  return content;
	}

	module.exports = function (opt) {
	  var ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
	  var router = express.Router();
	  var noop = function noop(req, res, next) {
	    next();
	  };
	  var callbackMiddlewares = [noop];

	  opt = opt || {};
	  opt.clientName = opt.clientName || 'Auth0 Extension';
	  opt.clientId = opt.clientId;
	  opt.exp = opt.exp || ONE_DAY_IN_MILLISECONDS;
	  opt.experimental = opt.experimental || false;
	  // If we defaults to true all the routes will require authentication
	  opt.credentialsRequired = typeof opt.credentialsRequired === 'undefined' ? false : opt.credentialsRequired;
	  opt.scopes = opt.scopes + ' openid profile';
	  opt.responseType = opt.responseType || 'token';
	  opt.tokenExpiresIn = opt.tokenExpiresIn || '10h';
	  opt.rootTenantAuthority = opt.rootTenantAuthority || 'https://auth0.auth0.com';
	  opt.authenticatedCallback = opt.authenticatedCallback || function (req, res, accessToken, next) {
	    next();
	  };

	  if (opt.apiToken && !opt.apiToken.secret) {
	    console.log('You are using a "development secret" for API token generation. Please setup your secret on "apiToken.secret".');
	    opt.apiToken.secret = __webpack_require__(15).randomBytes(32).toString('hex');
	  }

	  if (opt.apiToken && opt.apiToken.secret) {
	    callbackMiddlewares = [fetchUserInfo(opt.rootTenantAuthority), opt.apiToken.payload || noop, generateApiToken(opt.apiToken.secret, opt.tokenExpiresIn)];
	  }

	  router.use(function (req, res, next) {
	    var protocol = 'https';
	    var pathname = url.parse(req.originalUrl).pathname.replace(req.path, '');

	    if ((process.env.NODE_ENV || 'development') === 'development') {
	      protocol = req.protocol;
	      opt.clientId = opt.clientId || 'N3PAwyqXomhNu6IWivtsa3drBfFjmWJL';
	    }

	    res.locals.baseUrl = url.format({
	      protocol: protocol,
	      host: req.get('host'),
	      pathname: pathname
	    });

	    next();
	  });

	  router.use(bodyParser.urlencoded({ extended: false }));

	  router.use(expressJwt({
	    secret: rsaValidation(),
	    algorithms: ['RS256'],
	    credentialsRequired: opt.credentialsRequired
	  }).unless({ path: ['/login', '/callback'] }));

	  router.get('/login', function (req, res) {
	    var redirectUri = res.locals.baseUrl + '/callback';
	    if (req.query.returnTo) {
	      redirectUri += '?returnTo=' + encodeURIComponent(req.query.returnTo);
	    }
	    var audience;
	    if (typeof opt.audience === 'string') {
	      audience = '&audience=' + encodeURIComponent(opt.audience);
	    } else if (typeof opt.audience === 'function') {
	      var a = opt.audience(req);
	      if (typeof a === 'string') {
	        audience = '&audience=' + encodeURIComponent(a);
	      }
	    }
	    var authorizationUrl = [opt.rootTenantAuthority + (opt.experimental ? '/authorize' : '/i/oauth2/authorize'), '?client_id=' + (opt.clientId || res.locals.baseUrl), '&response_type=' + opt.responseType, '&response_mode=form_post', '&scope=' + encodeURIComponent(opt.scopes), '&expiration=' + opt.exp, '&redirect_uri=' + redirectUri, audience].join('');

	    res.redirect(authorizationUrl);
	  });

	  router.get('/logout', function (req, res) {
	    var template = ['html', '  head', '    script.', '      sessionStorage.removeItem(\'token\')', '      sessionStorage.removeItem(\'apiToken\')', '      window.location.href = \'' + opt.rootTenantAuthority + '/v2/logout?returnTo=#{baseUrl}&client_id=#{baseUrl}\';', '  body'].join('\n');
	    var content = jade.compile(template)({
	      baseUrl: res.locals.baseUrl
	    });

	    res.header("Content-Type", 'text/html');
	    res.status(200).send(content);
	  });

	  router.post('/callback', callbackMiddlewares, function (req, res) {
	    var token = req.body.access_token;
	    var dtoken = jwt.decode(token, { complete: true }) || {};

	    // Getting secret
	    rsaValidation()(req, dtoken.header, dtoken.payload, function (err, secret) {
	      if (err) {
	        return res.status(200).send(getUnAuthorizedTemplate(res, res));
	      }

	      // Verifying access_token
	      try {
	        var decoded = jwt.verify(token, secret, { algorithms: ['RS256'] });
	        var aud = decoded.aud;
	        var audience;

	        if (typeof opt.audience === 'string') {
	          audience = opt.audience;
	        } else if (typeof opt.audience === 'function') {
	          var a = opt.audience(req);
	          if (typeof a === 'string') {
	            audience = a;
	          }
	        }

	        // Checking audience
	        if (aud === audience || aud.indexOf(audience) === -1) {
	          res.header("Content-Type", 'text/html');
	          return res.status(200).send(getUnAuthorizedTemplate(req, res));
	        }
	      } catch (e) {
	        return res.status(200).send(getUnAuthorizedTemplate(res, res));
	      }

	      opt.authenticatedCallback(req, res, req.body.access_token, function (err) {
	        if (err) {
	          return res.sendStatus(500);
	        }

	        var template = ['html', '  head', '    script.', '      sessionStorage.setItem(\'token\', \'' + req.body.access_token + '\');', callbackMiddlewares.length === 1 ? '' : '      sessionStorage.setItem(\'apiToken\', \'' + req.apiToken + '\');', '      window.location.href = \'#{returnTo}\';', '  body'].join('\n');
	        var content = jade.compile(template)({
	          returnTo: req.query.returnTo ? req.query.returnTo : res.locals.baseUrl
	        });

	        res.header("Content-Type", 'text/html');
	        res.status(200).send(content);
	      });
	    });
	  });

	  router.get('/.well-known/oauth2-client-configuration', function (req, res) {
	    res.header("Content-Type", 'application/json');
	    res.status(200).send({
	      redirect_uris: [res.locals.baseUrl + '/callback'],
	      client_name: opt.clientName,
	      post_logout_redirect_uris: [res.locals.baseUrl]
	    });
	  });

	  return router;
	};

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = require("jade");

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = require("express-jwt");

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = require("url");

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = require("auth0-api-jwt-rsa-validation");

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = require("body-parser");

/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = require("jsonwebtoken");

/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = require("superagent");

/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = require("crypto");

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _express = __webpack_require__(5);

	var _express2 = _interopRequireDefault(_express);

	var _jsonwebtoken = __webpack_require__(13);

	var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

	var _urlJoin = __webpack_require__(17);

	var _urlJoin2 = _interopRequireDefault(_urlJoin);

	var _index = __webpack_require__(18);

	var _index2 = _interopRequireDefault(_index);

	var _bodyParser = __webpack_require__(12);

	var _bodyParser2 = _interopRequireDefault(_bodyParser);

	var _requestPromise = __webpack_require__(21);

	var _requestPromise2 = _interopRequireDefault(_requestPromise);

	var _verifyCaptcha = __webpack_require__(22);

	var _verifyCaptcha2 = _interopRequireDefault(_verifyCaptcha);

	var _createRuleResponse = __webpack_require__(23);

	var _createRuleResponse2 = _interopRequireDefault(_createRuleResponse);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var router = _express2.default.Router();

	router.use(function decodeAndValidateToken(req, res, next) {
	  var token = req.query.token || req.body.token;
	  var state = req.query.state || req.body.state;

	  var ctx = req.webtaskContext.data;
	  var secret = ctx.EXTENSION_SECRET;
	  var domain = ctx.AUTH0_DOMAIN;
	  var issuer = (0, _urlJoin2.default)(domain, 'captcha/rule');
	  var audience = (0, _urlJoin2.default)(domain, 'captcha/webtask');
	  _jsonwebtoken2.default.verify(token, secret, { issuer: issuer, audience: audience }, function (err, decoded) {
	    if (err) {
	      return (0, _createRuleResponse2.default)('Invalid token: ' + err.message, secret, null, issuer, audience).then(function (token) {
	        res.redirect(req.webtaskContext.data.AUTH0_DOMAIN + '/continue?state=' + req.query.state + '&token=' + token);
	      });
	    }
	    req.state = state;
	    req.token = token;
	    req.payload = decoded;
	    next();
	  });
	});

	router.use(_bodyParser2.default.urlencoded({
	  extended: true
	}));

	router.get('/', function (req, res) {
	  res.header("Content-Type", 'text/html');
	  res.status(200).send((0, _index2.default)(Object.assign({
	    token: req.token,
	    target: req.path
	  }, req.payload)));
	});

	router.post('/', function (req, res) {
	  var _req$ip = req.ip,
	      ip = _req$ip.ip,
	      state = _req$ip.state,
	      payload = _req$ip.payload;

	  var ctx = req.webtaskContext.data;
	  var sharedSecret = ctx.EXTENSION_SECRET;
	  var domain = ctx.AUTH0_DOMAIN;
	  var captchaResponse = req.body["g-recaptcha-response"];
	  var issuer = (0, _urlJoin2.default)(domain, 'captcha/rule');
	  var audience = (0, _urlJoin2.default)(domain, 'captcha/webtask');

	  (0, _verifyCaptcha2.default)(captchaResponse, sharedSecret, ip).then(function () {
	    return (0, _createRuleResponse2.default)(null, secret, payload, issuer, audience);
	  }, function (err) {
	    return (0, _createRuleResponse2.default)(err.message, secret, payload, issuer, audience);
	  }).then(function (token) {
	    res.redirect(domain + '/continue?state=' + state + '&token=' + token);
	  });
	});

	exports.default = router;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	(function (name, context, definition) {
	  if (typeof module !== 'undefined' && module.exports) module.exports = definition();else if (true) !(__WEBPACK_AMD_DEFINE_FACTORY__ = (definition), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));else context[name] = definition();
	})('urljoin', undefined, function () {

	  function normalize(str, options) {

	    // make sure protocol is followed by two slashes
	    str = str.replace(/:\//g, '://');

	    // remove consecutive slashes
	    str = str.replace(/([^:\s])\/+/g, '$1/');

	    // remove trailing slash before parameters or hash
	    str = str.replace(/\/(\?|&|#[^!])/g, '$1');

	    // replace ? in parameters with &
	    str = str.replace(/(\?.+)\?/g, '$1&');

	    return str;
	  }

	  return function () {
	    var input = arguments;
	    var options = {};

	    if (_typeof(arguments[0]) === 'object') {
	      // new syntax with array and options
	      input = arguments[0];
	      options = arguments[1] || {};
	    }

	    var joined = [].slice.call(input, 0).join('/');
	    return normalize(joined, options);
	  };
	});

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var jade = __webpack_require__(19);

	module.exports = function template(locals) {
	var buf = [];
	var jade_mixins = {};
	var jade_interp;
	;var locals_for_with = (locals || {});(function (siteKey, state, target, token) {
	buf.push("<!DOCTYPE html><html><head><meta charset=\"utf-8\"><meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><style type=\"text/css\">html {\nfont-family: sans-serif;\n-webkit-text-size-adjust: 100%;\n-ms-text-size-adjust: 100%;\n}\nbody { margin: 0; }\n.container { padding-right: 15px; padding-left: 15px;margin-right: auto; margin-left: auto; }\nh1 { margin: .67em 0; font-size: 2em; font-family: inherit; font-weight: 500; line-height: 1.1; color: inherit; }</style><title>Confirm you are human</title><!-- Latest compiled and minified CSS--><script src=\"https://www.google.com/recaptcha/api.js\"></script></head><body><script type=\"text/javascript\">var submitform = function() {\n  document.getElementById(\"captchaform\").submit();\n};</script><div class=\"container\"><form id=\"captchaform\"" + (jade.attr("action", target, true, true)) + " method=\"POST\" class=\"form-signin\"><h1>title</h1><p>message</p><input type=\"hidden\"" + (jade.attr("value", state, true, true)) + " name=\"state\"><input type=\"hidden\"" + (jade.attr("value", token, true, true)) + " name=\"token\"><div" + (jade.attr("data-sitekey", siteKey, true, true)) + " data-callback=\"submitform\" class=\"g-recaptcha\"></div></form></div></body></html>");}.call(this,"siteKey" in locals_for_with?locals_for_with.siteKey:typeof siteKey!=="undefined"?siteKey:undefined,"state" in locals_for_with?locals_for_with.state:typeof state!=="undefined"?state:undefined,"target" in locals_for_with?locals_for_with.target:typeof target!=="undefined"?target:undefined,"token" in locals_for_with?locals_for_with.token:typeof token!=="undefined"?token:undefined));;return buf.join("");
	}

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * Merge two attribute objects giving precedence
	 * to values in object `b`. Classes are special-cased
	 * allowing for arrays and merging/joining appropriately
	 * resulting in a string.
	 *
	 * @param {Object} a
	 * @param {Object} b
	 * @return {Object} a
	 * @api private
	 */

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	exports.merge = function merge(a, b) {
	  if (arguments.length === 1) {
	    var attrs = a[0];
	    for (var i = 1; i < a.length; i++) {
	      attrs = merge(attrs, a[i]);
	    }
	    return attrs;
	  }
	  var ac = a['class'];
	  var bc = b['class'];

	  if (ac || bc) {
	    ac = ac || [];
	    bc = bc || [];
	    if (!Array.isArray(ac)) ac = [ac];
	    if (!Array.isArray(bc)) bc = [bc];
	    a['class'] = ac.concat(bc).filter(nulls);
	  }

	  for (var key in b) {
	    if (key != 'class') {
	      a[key] = b[key];
	    }
	  }

	  return a;
	};

	/**
	 * Filter null `val`s.
	 *
	 * @param {*} val
	 * @return {Boolean}
	 * @api private
	 */

	function nulls(val) {
	  return val != null && val !== '';
	}

	/**
	 * join array as classes.
	 *
	 * @param {*} val
	 * @return {String}
	 */
	exports.joinClasses = joinClasses;
	function joinClasses(val) {
	  return (Array.isArray(val) ? val.map(joinClasses) : val && (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' ? Object.keys(val).filter(function (key) {
	    return val[key];
	  }) : [val]).filter(nulls).join(' ');
	}

	/**
	 * Render the given classes.
	 *
	 * @param {Array} classes
	 * @param {Array.<Boolean>} escaped
	 * @return {String}
	 */
	exports.cls = function cls(classes, escaped) {
	  var buf = [];
	  for (var i = 0; i < classes.length; i++) {
	    if (escaped && escaped[i]) {
	      buf.push(exports.escape(joinClasses([classes[i]])));
	    } else {
	      buf.push(joinClasses(classes[i]));
	    }
	  }
	  var text = joinClasses(buf);
	  if (text.length) {
	    return ' class="' + text + '"';
	  } else {
	    return '';
	  }
	};

	exports.style = function (val) {
	  if (val && (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object') {
	    return Object.keys(val).map(function (style) {
	      return style + ':' + val[style];
	    }).join(';');
	  } else {
	    return val;
	  }
	};
	/**
	 * Render the given attribute.
	 *
	 * @param {String} key
	 * @param {String} val
	 * @param {Boolean} escaped
	 * @param {Boolean} terse
	 * @return {String}
	 */
	exports.attr = function attr(key, val, escaped, terse) {
	  if (key === 'style') {
	    val = exports.style(val);
	  }
	  if ('boolean' == typeof val || null == val) {
	    if (val) {
	      return ' ' + (terse ? key : key + '="' + key + '"');
	    } else {
	      return '';
	    }
	  } else if (0 == key.indexOf('data') && 'string' != typeof val) {
	    if (JSON.stringify(val).indexOf('&') !== -1) {
	      console.warn('Since Jade 2.0.0, ampersands (`&`) in data attributes ' + 'will be escaped to `&amp;`');
	    };
	    if (val && typeof val.toISOString === 'function') {
	      console.warn('Jade will eliminate the double quotes around dates in ' + 'ISO form after 2.0.0');
	    }
	    return ' ' + key + "='" + JSON.stringify(val).replace(/'/g, '&apos;') + "'";
	  } else if (escaped) {
	    if (val && typeof val.toISOString === 'function') {
	      console.warn('Jade will stringify dates in ISO form after 2.0.0');
	    }
	    return ' ' + key + '="' + exports.escape(val) + '"';
	  } else {
	    if (val && typeof val.toISOString === 'function') {
	      console.warn('Jade will stringify dates in ISO form after 2.0.0');
	    }
	    return ' ' + key + '="' + val + '"';
	  }
	};

	/**
	 * Render the given attributes object.
	 *
	 * @param {Object} obj
	 * @param {Object} escaped
	 * @return {String}
	 */
	exports.attrs = function attrs(obj, terse) {
	  var buf = [];

	  var keys = Object.keys(obj);

	  if (keys.length) {
	    for (var i = 0; i < keys.length; ++i) {
	      var key = keys[i],
	          val = obj[key];

	      if ('class' == key) {
	        if (val = joinClasses(val)) {
	          buf.push(' ' + key + '="' + val + '"');
	        }
	      } else {
	        buf.push(exports.attr(key, val, false, terse));
	      }
	    }
	  }

	  return buf.join('');
	};

	/**
	 * Escape the given string of `html`.
	 *
	 * @param {String} html
	 * @return {String}
	 * @api private
	 */

	exports.escape = function escape(html) {
	  var result = String(html).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	  if (result === '' + html) return html;else return result;
	};

	/**
	 * Re-throw the given `err` in context to the
	 * the jade in `filename` at the given `lineno`.
	 *
	 * @param {Error} err
	 * @param {String} filename
	 * @param {String} lineno
	 * @api private
	 */

	exports.rethrow = function rethrow(err, filename, lineno, str) {
	  if (!(err instanceof Error)) throw err;
	  if ((typeof window != 'undefined' || !filename) && !str) {
	    err.message += ' on line ' + lineno;
	    throw err;
	  }
	  try {
	    str = str || __webpack_require__(20).readFileSync(filename, 'utf8');
	  } catch (ex) {
	    rethrow(err, null, lineno);
	  }
	  var context = 3,
	      lines = str.split('\n'),
	      start = Math.max(lineno - context, 0),
	      end = Math.min(lines.length, lineno + context);

	  // Error context
	  var context = lines.slice(start, end).map(function (line, i) {
	    var curr = i + start + 1;
	    return (curr == lineno ? '  > ' : '    ') + curr + '| ' + line;
	  }).join('\n');

	  // Alter exception message
	  err.path = filename;
	  err.message = (filename || 'Jade') + ':' + lineno + '\n' + context + '\n\n' + err.message;
	  throw err;
	};

	exports.DebugItem = function DebugItem(lineno, filename) {
	  this.lineno = lineno;
	  this.filename = filename;
	};

/***/ },
/* 20 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 21 */
/***/ function(module, exports) {

	module.exports = require("request-promise");

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = verifyCaptcha;

	var _request = __webpack_require__(3);

	var _request2 = _interopRequireDefault(_request);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function verifyCaptcha(captchaResponse, secret, ip) {

	  return new Promise(function (request, resolve) {

	    function handleResponse(error, response, body) {
	      if (error) {
	        reject(error);
	      }

	      if (response.statusCode !== 200) {
	        reject('Error validating captcha: ' + response.statusCode);
	      }

	      var data = JSON.parse(body);

	      if (data.success) {
	        resolve(true);
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

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = createRuleResponse;

	var _jsonwebtoken = __webpack_require__(13);

	var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function createRuleResponse(err, secret, subject, audience, issuer) {
	  return new Promise(function (resolve, reject) {
	    var payload = {
	      captchaOk: err === null,
	      sub: subject,
	      errorMessage: err
	    };

	    var header = {
	      expiresIn: "2m",
	      audience: audience,
	      issuer: issuer
	    };

	    _jsonwebtoken2.default.sign(payload, secret, header, function (err, token) {
	      if (err) return reject(err);
	      resolve(token);
	    });
	  });
	}

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _express = __webpack_require__(5);

	var _express2 = _interopRequireDefault(_express);

	var _request = __webpack_require__(3);

	var _request2 = _interopRequireDefault(_request);

	var _auth = __webpack_require__(25);

	var _auth2 = _interopRequireDefault(_auth);

	var _jsonwebtoken = __webpack_require__(13);

	var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

	var _urlJoin = __webpack_require__(17);

	var _urlJoin2 = _interopRequireDefault(_urlJoin);

	var _checkCaptcha = __webpack_require__(26);

	var _checkCaptcha2 = _interopRequireDefault(_checkCaptcha);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function findRule(rules, name) {
	  return rules.filter(function (rule) {
	    return rule.name === name;
	  })[0];
	}

	var ManagementClient = _auth2.default.ManagementClient;
	var hooks = _express2.default.Router();

	/*
	 * Accepts a string path and returns an Express.Middleware
	 * which verifies if the audience for jwt included that path
	 * along with the issuer etc.
	 */
	function createRuleValidator(path) {
	  return function (req, res, next) {
	    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
	      var token = req.headers.authorization.split(' ')[1];
	      var isValid = _jsonwebtoken2.default.verify(token, req.webtaskContext.data.EXTENSION_SECRET, {
	        audience: (0, _urlJoin2.default)(req.webtaskContext.data.WT_URL, path),
	        issuer: 'https://' + req.webtaskContext.data.AUTH0_DOMAIN
	      });

	      if (!isValid) {
	        return res.sendStatus(401);
	      }

	      return next();
	    }

	    return res.sendStatus(401);
	  };
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
	hooks.get('/checkall', function (a, b) {
	  b.status(200).end('Ok');
	});

	// This endpoint would be called by webtask-gallery
	hooks.post('/on-install', function (req, res) {
	  var ctx = req.webtaskContext.data;

	  req.auth0.rules.create({
	    name: 'captcha-rule-PLEASE-DO-NOT-RENAME',
	    script: (0, _checkCaptcha2.default)({
	      MAX_ALLOWED_FAILED_ATTEMPTS: ctx.MAX_ALLOWED_FAILED_ATTEMPTS
	    }),
	    order: 2,
	    enabled: true,
	    stage: "login_success"
	  }).then(function () {
	    res.sendStatus(204);
	  }).catch(function () {
	    res.sendStatus(500);
	  });
	});

	// This endpoint would be called by webtask-gallery
	hooks.put('/on-update', function (req, res) {
	  res.sendStatus(204);
	});

	// This endpoint would be called by webtask-gallery
	hooks.delete('/on-uninstall', function (req, res) {
	  req.auth0.rules.getAll().then(function (rules) {
	    var rule = findRule(rules, 'captcha-rule-PLEASE-DO-NOT-RENAME');

	    if (rule) {
	      req.auth0.rules.delete({ id: rule.id }).then(function () {
	        res.sendStatus(204);
	      }).catch(function () {
	        res.sendStatus(500);
	      });
	    }
	  }).catch(function () {
	    res.sendStatus(500);
	  });
	});

	function getToken(req, cb) {
	  var ctx = req.webtaskContext.data;
	  var domain = ctx.AUTH0_DOMAIN;

	  var apiUrl = 'https://' + domain + '/oauth/token';
	  var audience = 'https://' + domain + '/api/v2/';
	  var clientSecret = ctx.AUTH0_CLIENT_SECRET;
	  var clientId = ctx.AUTH0_CLIENT_ID;

	  return new Promise(function (resolve, reject) {
	    var config = {
	      body: {
	        audience: audience,
	        grant_type: 'client_credentials',
	        client_id: clientId,
	        client_secret: clientSecret
	      },
	      json: true
	    };

	    _request2.default.post(apiUrl, config, function (err, response, body) {
	      if (err) return reject(err);
	      resolve(body.access_token);
	    });
	  });
	}

	exports.default = hooks;

/***/ },
/* 25 */
/***/ function(module, exports) {

	module.exports = require("auth0");

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = createRule;
	function createRule(config) {
	  var rule = function (user, context, callback) {
	    // Based on work done by Nicolas Sebana
	    var secret = configuration.CAPTCHA_SECRET;
	    var jwt = __webpack_require__(13);

	    if (context.protocol === "redirect-callback") {

	      // handle signed response
	      var postVerify = function postVerify(err, decoded) {
	        if (err) {
	          return callback(new UnauthorizedError("Error validating token from wt: " + err));
	        } else if (decoded.sub !== user.user_id) {
	          return callback(new UnauthorizedError("Token does not match the current user."));
	        } else if (!decoded.captchaOk) {
	          return callback(new UnauthorizedError("Captcha validation was not successful.\n" + decoded.errorMessage || ""));
	        } else {
	          // Captcha ok, go ahead with authentication
	          return callback(null, user, context);
	        }
	      };

	      ;

	      return jwt.verify(context.request.query.token, secret, {
	        audience: ruleUri,
	        issuer: wtUri
	      }, postVerify);
	    }

	    // This will create a management client with elavated privilages

	    if (MAX_ALLOWED_FAILED_ATTEMPTS) {
	      var client = __webpack_require__(27).ManagementClient(auth0.accessToken);
	      client.logs.getAll({
	        q: "date: [" + (user.last_login || '*') + " to '*'] AND type: (\"f\" OR \"fp\" OR \"fu\") AND user_id: \"" + req.user_id + "\""
	      }).then(redirectToCaptcha).catch(function () {
	        return callback(new Error('There was an error completing login, please try again later'));
	      });
	    } else {
	      redirectToCaptcha([], true);
	    }

	    function redirectToCaptcha(logs, forced) {
	      if (forced || logs.length > MAX_ALLOWED_FAILED_ATTEMPTS) {
	        var token = jwt.sign({
	          sub: user.user_id,
	          clientName: context.clientName
	        }, secret, {
	          expiresInMinutes: 5,
	          audience: wtUri,
	          issuer: ruleUri
	        });
	        // This will redirect to the right place
	        var redirectUrl = auth0.domain.replace('.auth0.com', '') + '.webtask.io/captcha';

	        var separator = redirectUrl.indexOf('?') !== -1 ? "&" : "?";

	        // Issue the redirect command
	        context.redirect = {
	          url: redirectUrl + separator + "token=" + token + "&webtask_no_cache=1"
	        };
	      }

	      return callback(null, user, context);
	    }
	  }.toString();

	  Object.keys(config).forEach(function (key) {
	    var re = new RegExp(key, 'g');
	    rule = rule.replace(re, 'JSON.parse(' + JSON.stringify(config[key]) + ')');
	  });
	}

/***/ },
/* 27 */
/***/ function(module, exports) {

	module.exports = require("auth0@2.1.0");

/***/ }
/******/ ]);