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

	var _index = __webpack_require__(2);

	var _index2 = _interopRequireDefault(_index);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// This is the entry-point for the Webpack build. We need to convert our module
	// (which is a simple Express server) into a Webtask-compatible function.
	module.exports = _webtaskTools2.default.fromExpress(_index2.default);

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("webtask-tools");

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _express = __webpack_require__(3);

	var _express2 = _interopRequireDefault(_express);

	var _webtask = __webpack_require__(4);

	var _webtask2 = _interopRequireDefault(_webtask);

	var _routes = __webpack_require__(14);

	var _routes2 = _interopRequireDefault(_routes);

	var _hooks = __webpack_require__(23);

	var _hooks2 = _interopRequireDefault(_hooks);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var app = (0, _express2.default)();

	app.use('/.extensions', _hooks2.default);
	app.use(_routes2.default);

	app.use(function (err, req, res, next) {
	  console.log(err);
	  console.log(req.path);
	  return res.status(501).end('Internal Server Error');
	});

	exports.default = app;

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("express");

/***/ },
/* 4 */
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
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */
/***/ function(module, exports) {

	module.exports = require("body-parser");

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = require("jsonwebtoken");

/***/ },
/* 12 */,
/* 13 */,
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _express = __webpack_require__(3);

	var _express2 = _interopRequireDefault(_express);

	var _jsonwebtoken = __webpack_require__(11);

	var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

	var _urlJoin = __webpack_require__(15);

	var _urlJoin2 = _interopRequireDefault(_urlJoin);

	var _index = __webpack_require__(16);

	var _index2 = _interopRequireDefault(_index);

	var _bodyParser = __webpack_require__(10);

	var _bodyParser2 = _interopRequireDefault(_bodyParser);

	var _requestPromise = __webpack_require__(19);

	var _requestPromise2 = _interopRequireDefault(_requestPromise);

	var _verifyCaptcha = __webpack_require__(20);

	var _verifyCaptcha2 = _interopRequireDefault(_verifyCaptcha);

	var _createRuleResponse = __webpack_require__(22);

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
/* 15 */
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
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var jade = __webpack_require__(17);

	module.exports = function template(locals) {
	var buf = [];
	var jade_mixins = {};
	var jade_interp;
	;var locals_for_with = (locals || {});(function (siteKey, state, target, token) {
	buf.push("<!DOCTYPE html><html><head><meta charset=\"utf-8\"><meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><style type=\"text/css\">html {\nfont-family: sans-serif;\n-webkit-text-size-adjust: 100%;\n-ms-text-size-adjust: 100%;\n}\nbody { margin: 0; }\n.container { padding-right: 15px; padding-left: 15px;margin-right: auto; margin-left: auto; }\nh1 { margin: .67em 0; font-size: 2em; font-family: inherit; font-weight: 500; line-height: 1.1; color: inherit; }</style><title>Confirm you are human</title><!-- Latest compiled and minified CSS--><script src=\"https://www.google.com/recaptcha/api.js\"></script></head><body><script type=\"text/javascript\">var submitform = function() {\n  document.getElementById(\"captchaform\").submit();\n};</script><div class=\"container\"><form id=\"captchaform\"" + (jade.attr("action", target, true, true)) + " method=\"POST\" class=\"form-signin\"><h1>title</h1><p>message</p><input type=\"hidden\"" + (jade.attr("value", state, true, true)) + " name=\"state\"><input type=\"hidden\"" + (jade.attr("value", token, true, true)) + " name=\"token\"><div" + (jade.attr("data-sitekey", siteKey, true, true)) + " data-callback=\"submitform\" class=\"g-recaptcha\"></div></form></div></body></html>");}.call(this,"siteKey" in locals_for_with?locals_for_with.siteKey:typeof siteKey!=="undefined"?siteKey:undefined,"state" in locals_for_with?locals_for_with.state:typeof state!=="undefined"?state:undefined,"target" in locals_for_with?locals_for_with.target:typeof target!=="undefined"?target:undefined,"token" in locals_for_with?locals_for_with.token:typeof token!=="undefined"?token:undefined));;return buf.join("");
	}

/***/ },
/* 17 */
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
	    str = str || __webpack_require__(18).readFileSync(filename, 'utf8');
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
/* 18 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 19 */
/***/ function(module, exports) {

	module.exports = require("request-promise");

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = verifyCaptcha;

	var _request = __webpack_require__(21);

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
/* 21 */
/***/ function(module, exports) {

	module.exports = require("request");

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = createRuleResponse;

	var _jsonwebtoken = __webpack_require__(11);

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
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _express = __webpack_require__(3);

	var _express2 = _interopRequireDefault(_express);

	var _request = __webpack_require__(21);

	var _request2 = _interopRequireDefault(_request);

	var _auth = __webpack_require__(24);

	var _auth2 = _interopRequireDefault(_auth);

	var _jsonwebtoken = __webpack_require__(11);

	var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

	var _urlJoin = __webpack_require__(15);

	var _urlJoin2 = _interopRequireDefault(_urlJoin);

	var _checkCaptcha = __webpack_require__(25);

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
	hooks.get('/', function (a, b) {
	  b.status(200).end('Ok');
	});

	// This endpoint would be called by webtask-gallery
	hooks.post('/on-install', function (req, res) {
	  var ctx = req.webtaskContext.data;

	  req.auth0.rules.create({
	    name: 'captcha-rule-PLEASE-DO-NOT-RENAME',
	    script: (0, _checkCaptcha2.default)({
	      MAX_ALLOWED_FAILED_ATTEMPTS: ctx.MAX_ALLOWED_FAILED_ATTEMPTS || 0,
	      CAPTCHA_URL: (0, _urlJoin2.default)(ctx.WT_URL),
	      EXTENSION_SECRET: ctx.EXTENSION_SECRET
	    }),
	    order: 2,
	    enabled: true,
	    stage: "login_success"
	  }).then(function () {
	    res.sendStatus(204);
	  }).catch(function (e) {
	    console.log(e);
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
/* 24 */
/***/ function(module, exports) {

	module.exports = require("auth0@2.1.0");

/***/ },
/* 25 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = createRule;
	function createRule(config) {
	  var rule = function (user, context, callback) {
	    // Based on work done by Nicolas Sebana
	    var jwt = escapeRequire('jsonwebtoken');
	    var audience = "https://" + auth0.domain + "/captcha/webtask";
	    var issuer = "https://" + auth0.domain + "/captcha/rule";

	    var config = CONFIG;
	    var secret = config.EXTENSION_SECRET;
	    var redirectUrl = config.CAPTCHA_URL;
	    var maxAllowedFailed = config.MAX_ALLOWED_FAILED_ATTEMPTS;

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
	        audience: issuer,
	        issuer: audience
	      }, postVerify);
	    }

	    // This will create a management client with elavated privilages

	    if (maxAllowedFailed) {
	      var client = escapeRequire('auth0@2.1.0').ManagementClient(auth0.accessToken);
	      client.logs.getAll({
	        q: "date: [" + (user.last_login || '*') + " to '*'] AND type: (\"f\" OR \"fp\" OR \"fu\") AND user_id: \"" + user.user_id + "\""
	      }).then(redirectToCaptcha).catch(function () {
	        return callback(new Error('There was an error completing login, please try again later'));
	      });
	    } else {
	      redirectToCaptcha([], true);
	    }

	    function redirectToCaptcha(logs, forced) {
	      if (forced || logs.length > maxAllowedFailed) {
	        var token = jwt.sign({
	          sub: user.user_id,
	          clientName: context.clientName
	        }, secret, {
	          expiresInMinutes: 5,
	          audience: audience,
	          issuer: issuer
	        });
	        var separator = redirectUrl.indexOf('?') !== -1 ? "&" : "?";

	        // Issue the redirect command
	        context.redirect = {
	          url: redirectUrl + separator + "token=" + token + "&webtask_no_cache=1"
	        };
	      }

	      return callback(null, user, context);
	    }
	  }.toString();

	  var re = new RegExp('CONFIG', 'g');
	  var rr = new RegExp('escapeRequire', 'g');

	  rule = rule.replace(re, 'JSON.parse(\'' + JSON.stringify(config) + '\')');
	  rule = rule.replace(rr, 'require');
	  return rule;
	}

/***/ }
/******/ ]);