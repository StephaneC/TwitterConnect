var express = require('express')
    , passport = require('passport')
    , util = require('util')
    , TwitterStrategy = require('passport-twitter').Strategy
    , session = require('express-session')
    , cookieParser = require('cookie-parser')
    , bodyParser = require('body-parser')
    , config = require('./configuration/config.json')
    , app = express();

passport.use(new TwitterStrategy({
            consumerKey: config.twitter_api_key,
            consumerSecret: config.twitter_api_secret,
            callbackURL: config.callback_url
        },
        function (token, tokenSecret, profile, done) {
            process.nextTick(function () {
                profile.access_token = token;
                profile.token_secret = tokenSecret;
                return done(null, profile);
            })
        })
);

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({secret: 'keyboard cat', key: 'sid'}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/twitter/connected', function (req, res) {
    	console.log("auth/twitter/connected");
	res.send('<html><h1>EQwall</h1></html>');
});

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback', function(){
    console.log("/auth/twitter/callback");
    passport.authenticate('twitter', {successRedirect: '/', failureRedirect: '/login'}),
    function (req, res) {
	var params="?access_token="+req.user.access_token;
        console.log("redirect to" + config.logged_url+params);
    	res.redirect(config.logged_url+params);
    }
});

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

// Passport session setup.
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login')
}

app.listen(3000);
