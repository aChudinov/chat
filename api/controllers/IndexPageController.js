/*global Passport */

/**
 * IndexPageController
 *
 * @description :: Server-side logic for managing indexpages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

    /**
     * `IndexPageController.index()`
     */
    index : function (req, res) {
        if(req.session.User) {
            Passport.findOne({
                identifier : req.session.User.id
            }, function (err, passport) {
                if(err) {
                    res.send(err);
                }
                sails.sockets.blast('newUserLoggedIn', req.session.User.name);
                res.render({
                    data : {
                        title : 'Welcome to indexPage',
                        indexPage : JSON.stringify(passport, null, 2)
                    }
                });
            });
        } else {
            sails.sockets.blast('newUserConnected', 'New anonymous user connected to application.');
            res.render({
                data : {
                    title : 'Welcome to indexPage',
                    indexPage : 'No User!'
                }
            });
        }
    }
};
