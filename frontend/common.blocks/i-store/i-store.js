/**
 * @module i-store
 * @description Коллекции каналов, приватных бесед, пользователей
 */

modules.define('i-store', ['i-bem', 'i-chat-api', 'events__channels', 'lodash'],

function(provide, BEM, chatAPI, channels, _){
    var BOT_PROFILE = {
        is_bot : true,
        name : 'slackbot',
        real_name : 'Бот',
        presence : 'active',
        profile : {
            image_32 : 'static/images/bot_32.png',
            image_48 : 'static/images/bot_48.png'
        }
    };

    var _users = [];
    var _channels = [];
    var _ims = [];

    var Store = {

        fetchUsers : function(){
            return chatAPI.get('users.list').then(function(data){
                if(data.members && data.members.length) {
                    _users = data.members;

                    this.emit('users-loaded');
                }
            }.bind(this));
        },

        fetchChannels : function(){
            return chatAPI.get('channels.list').then(function(data){
                if(data.channels && data.channels.length) {
                    _channels = data.channels;

                    this.emit('channels-loaded');
                }
            }.bind(this));
        },

        fetchIms : function(){
            return chatAPI.get('im.list').then(function(data){
                if(data.ims && data.ims.length) {
                    _ims = data.ims;

                    this.emit('ims-loaded');
                }
            }.bind(this));
        },

        getUser : function(id){
            var user = _.find(_users, { id : id });

            return user || BOT_PROFILE;
        },

        getUsers : function(){
            return _users;
        },

        getChannel : function(id){
            var channel = _.find(_channels, { id : id });

            return channel || {};
        },

        getChannelItem : function(){

        },

        getChannels : function(){
            return _channels;
        },

        getIm : function(id){
            var im = _.find(_ims, { id : id });

            return im || {};
        },

        getImItem : function(){

        },

        getIms : function(){
            return _ims;
        }
    };

    provide(BEM.decl(this.name, {}, Store));
});
