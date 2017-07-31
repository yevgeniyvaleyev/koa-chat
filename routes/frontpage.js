exports.get = async function(ctx, next) {
  if (ctx.isAuthenticated()) {
    ctx.body = ctx.render('welcome', {
      name: ctx.state.user.displayName
    });
  } else {
    ctx.body = ctx.render('login');
  }

};

