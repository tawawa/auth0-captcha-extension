export default function createRule(config) {
  let rule = (function (user, context, callback) {
    // Based on work done by Nicolas Sebana
    var secret = configuration.CAPTCHA_SECRET;
    var jwt = require('jsonwebtoken');

    if (context.protocol === "redirect-callback") {

      // handle signed response
      function postVerify(err, decoded) {
        if (err) {
          return callback(new UnauthorizedError("Error validating token from wt: " + err));
        } else if (decoded.sub !== user.user_id) {
          return callback(new UnauthorizedError("Token does not match the current user."));
        } else if (!decoded.captchaOk) {
          return callback(new UnauthorizedError("Captcha validation was not successful.\n" +
            decoded.errorMessage || ""));
        } else {
          // Captcha ok, go ahead with authentication
          return callback(null, user, context);
        }
      };

      return jwt.verify(
        context.request.query.token,
        secret,
        {
          audience: ruleUri,
          issuer: wtUri
        },
        postVerify
      );
    }


    // This will create a management client with elavated privilages

    if (MAX_ALLOWED_FAILED_ATTEMPTS) {
      const client = require('auth0@2.1.0').ManagementClient(auth0.accessToken);
      client.logs.getAll({
        q: `date: [${user.last_login || '*'} to '*'] AND type: ("f" OR "fp" OR "fu") AND user_id: "${req.user_id}"`
      }).then(redirectToCaptcha).catch(function (){
        return callback(new Error('There was an error completing login, please try again later'));
      });
    }else{
      redirectToCaptcha([], true);
    }

    function redirectToCaptcha(logs, forced) {
      if (forced || logs.length > MAX_ALLOWED_FAILED_ATTEMPTS) {
        var token = jwt.sign({
          sub: user.user_id,
          clientName: context.clientName
        },
          secret,
          {
            expiresInMinutes: 5,
            audience: wtUri,
            issuer: ruleUri
          }
        );
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

  }).toString();

  Object.keys(config).forEach(function(key){
    const re = new RegExp(key, 'g');
    rule = rule.replace(re, 'JSON.parse(' + JSON.stringify(config[key]) + ')');
  });
}
