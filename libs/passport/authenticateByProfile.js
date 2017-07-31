const User = require('../../models/user');
const config = require('config');
const co = require('co');
const request = require('request-promise');

function UserAuthError(message) {
  this.message = message;
}

module.exports = async function(req, profile, done) {
  // profile = the data returned by the facebook graph api

  // console.log(profile);

  const userToConnect = req.user;

  const providerNameId = makeProviderId(profile);   // "facebook:123456"

  let user;

  if (userToConnect) {
    // merge auth result with the user profile if it is not bound anywhere yet

    // look for another user already using ctx profile
    const alreadyConnectedUser = await User.findOne({
      "providers.nameId": providerNameId,
      _id:                {$ne: userToConnect._id}
    });

    if (alreadyConnectedUser) {
      // if old user is in read-only,
      // I can't just reattach the profile to the new user and keep logging in w/ it

      // before ctx social login was used by alreadyConnectedUser
      // now we clean the connection to make a new one
      for (const i = 0; i < alreadyConnectedUser.providers.length; i++) {
        const provider = alreadyConnectedUser.providers[i];
        if (provider.nameId == providerNameId) {
          provider.remove();
          i--;
        }
      }
      await alreadyConnectedUser.save();
    }

    user = userToConnect;

  } else {
    user = await User.findOne({"providers.nameId": providerNameId});

    if (!user) {
      // if we have user with same email, assume it's exactly the same person as the new man
      // trust social network here (actually should ask for password)
      user = await User.findOne({email: profile.emails[0].value});

      if (!user) {
        // auto-register
        user = new User();
      }
    }
  }

  mergeProfile(user, profile);

  try {
    await function(callback) {
      user.validate(callback);
    };
  } catch (e) {
    console.log(user);
    // there's a required field
    // maybe, when the user was on the remote social login screen, he disallowed something?
    throw new UserAuthError("Недостаточно данных, разрешите их передачу, пожалуйста.");
  }
  try {
    await user.save();
    done(null, user);
  } catch (err) {
    if (err instanceof UserAuthError) {
      done(null, false, {message: err.message});
    } else {
      done(err);
    }
  }
};



function mergeProfile(user, profile) {
  if (!user.photo && profile.photos && profile.photos.length && profile.photos[0].type != 'default') {
    // assign an avatar unless it's default
    user.photo = profile.photos[0].value;
  }

  if (!user.email && profile.emails && profile.emails.length) {
    user.email = profile.emails[0].value; // may be many emails
  }

  if (!user.displayName && profile.displayName) {
    user.displayName = profile.displayName;
  }

  if (!user.realName && profile.realName) {
    user.realName = profile.realName;
  }

  if (!user.gender && profile.gender) {
    user.gender = profile.gender;
  }

  // remove previous profile from the same provider, replace by the new one
  const nameId = makeProviderId(profile);
  for (const i = 0; i < user.providers.length; i++) {
    const provider = user.providers[i];
    if (provider.nameId == nameId) {
      provider.remove();
      i--;
    }
  }

  user.providers.push({
    name:    profile.provider,
    nameId:  makeProviderId(profile),
    profile: profile
  });

  user.verifiedEmail = true;
}

function makeProviderId(profile) {
  return profile.provider + ":" + profile.id;
}
