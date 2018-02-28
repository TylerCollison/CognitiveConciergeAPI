var passport = require('passport')
    , FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
    clientID: 177471233039156,
    clientSecret: 4cb84bc74b0153e96ce07b791a1f7e18,
    callbackURL: "http://www.example.com/auth/facebook/callback"
},
    function (accessToken, refreshToken, profile, done) {
        User.findOrCreate(..., function (err, user) {
            if (err) { return done(err); }
            done(null, user);
        });
    }
));



var request = require('request');
var OAuth2 = require('oauth2').OAuth2;

var oauth2 = new OAuth2("177471233039156",
    "4cb84bc74b0153e96ce07b791a1f7e18",
    "", "https://www.facebook.com/dialog/oauth",
    "https://graph.facebook.com/oauth/access_token",
    null);

app.get('/facebook/auth', function (req, res) {
    var redirect_uri = "localhost:8080" + "/auth/facebook/callback";
    // For eg. "http://localhost:8080/facebook/callback"
    var params = { 'redirect_uri': redirect_uri, 'scope': 'user_about_me,publish_actions' };
    res.redirect(oauth2.getAuthorizeUrl(params));
});



app.get('/facebook-search/:id', (req, res) => {

    // you need permission for most of these fields
    const userFieldSet = 'id, name, about, accounts, picture, photos, feed';

    const options = {
        method: 'GET',
        uri: `https://graph.facebook.com/v2.8/${req.params.id}`,
        qs: {
            access_token: user_access_token,
            fields: userFieldSet
        }
    };
    request(options)
        .then(fbRes => {
            res.json(fbRes);
        })
})
