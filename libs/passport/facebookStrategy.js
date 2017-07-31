const User = require('../../models/user');
const FacebookStrategy = require('passport-facebook').Strategy;
const authenticateByProfile = require('./authenticateByProfile');
const config = require('config');
const request = require('request-promise');

/*
 Returns fields:
{
  "id": "765813916814019",
  "email": "login\u0040mail.ru",
  "gender": "male",
  "link": "https:\/\/www.facebook.com\/app_scoped_user_id\/765813916814019\/",
  "locale": "ru_RU",
  "timezone": 4,
  "name": "Ilya Kantor",
  "last_name": "Kantor",
  "first_name": "Ilya"
}

 If I add "picture" to profileURL?fields, I get a *small* picture.

 Real picture is (public):
 (76581...19 is user id)
 http://graph.facebook.com/v2.7/765813916814019/picture?redirect=0&width=1000&height=1000

 redirect=0 means to get meta info, not picture
 then check is_silhouette (if true, no avatar)

 then if is_silhouette = false, go URL
 (P.S. width/height are unreliable, not sure which exactly size we get)

*/

function UserAuthError(message) {
  this.message = message;
}

module.exports = new FacebookStrategy({
    clientID:          config.providers.facebook.appId,
    clientSecret:      config.providers.facebook.appSecret,
    callbackURL:       config.server.siteHost + "/oauth/facebook",
    // fields are described here:
    // https://developers.facebook.com/docs/graph-api/reference/v2.7/user
    profileURL:        'https://graph.facebook.com/me?fields=id,about,email,gender,link,locale,timezone,name,last_name,first_name,middle_name',
    passReqToCallback: true
  },
  async function(req, accessToken, refreshToken, profile, done) {

    // req example:
    // '/callback/facebook?code=...',

    // accessToken:
    // ... (from ?code)

    // refreshToken:
    // undefined
    try {
      console.log(profile);

      let permissionError = null;
      // facebook won't allow to use an email w/o verification
      if (!profile.emails || !profile.emails[0]) { // user may allow authentication, but disable email access (e.g in fb)
        permissionError = "При входе разрешите доступ к email. Он используется для идентификации пользователя.";
      }

      if (permissionError) {
        // revoke facebook auth, so that next time facebook will ask it again (otherwise it won't)
        let response = await request({
          method: 'DELETE',
          json: true,
          url: "https://graph.facebook.com/me/permissions?access_token=" + accessToken
        });

        if (!response.success) {
          throw new Error("Facebook auth delete call returned invalid result " + response);
        }

        throw new UserAuthError(permissionError);
      }

      let response = await request.get({
        url: 'http://graph.facebook.com/v2.7/' + profile.id + '/picture?redirect=0&width=1000&height=1000',
        json: true
      });

      const photoData = response.data;

      profile.photos = [{
        value: photoData.url,
        type: photoData.is_silhouette ? 'default' : 'photo'
      }];

      profile.realName = profile._json.name;

      authenticateByProfile(req, profile, done);
    } catch (err) {
      console.log(err);
      if (err instanceof UserAuthError) {
        done(null, false, {message: err.message});
      } else {
        done(err);
      }
    }
  }
);
