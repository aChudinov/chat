/**
 * Passport configuration
 *
 * This if the configuration for your Passport.js setup and it where you'd
 * define the authentication strategies you want your application to employ.
 *
 * I have tested the service with all of the providers listed below - if you
 * come across a provider that for some reason doesn't work, feel free to open
 * an issue on GitHub.
 *
 * Also, authentication scopes can be set through the `scope` property.
 *
 * For more information on the available providers, check out:
 * http://passportjs.org/guide/providers/
 */

module.exports.passport = {
    slack : {
        name : 'Slack',
        protocol : 'oauth2',
        strategy : require('passport-slack').Strategy,
        options : {
            clientID : process.env.SLACK_CLIENT,
            clientSecret : process.env.SLACK_SECRET,
            callbackURL : process.env.SLACK_REDIRECT,
            scope : process.env.SLACK_SCOPE
        }
    }
};
