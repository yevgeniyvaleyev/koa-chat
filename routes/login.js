
const passport = require('koa-passport');

// запускает стратегию, станадартные опции что делать с результатом
// опции @https://github.com/jaredhanson/passport/blob/master/lib/middleware/authenticate.js
// можно передать и функцию
// ctx.flash('error', { message: 'Нет такого пользователя или пароль неверен.' }));
// ctx.session.passport.user = serialize(user);
exports.post = passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/',
    //failureMessage: true // запишет сообщение об ошибке в session.messages[]
    failureFlash: true // req.flash, better

    // assignProperty: 'something' присвоить юзера в свойство req.something
    //   - нужно для привязывания акков соц. сетей
    // если не стоит, то залогинит его вызовом req.login(user),
    //   - это поместит user.id в session.passport.user (если не стоит опция session:false)
    //   - также присвоит его в req.user
});

/*
 // @see node_modules/koa-passport/lib/framework/koa.js for passport.authenticate
 // it returns the middleware to delegate
 exports.post = passport.authenticate('local', async function(err, user, info) {
 // ...
 });
 */

