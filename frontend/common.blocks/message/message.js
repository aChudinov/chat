/**
 * @module message
 */
modules.define('message',
    ['i-bem__dom', 'BEMHTML', 'i-store', 'emojify', 'marked'],
function(provide, BEMDOM, BEMHTML, Store, emojify, marked){

/**
 * @exports
 * @class message
 */
provide(BEMDOM.decl(this.name, {}, {

    /**
     * Возвращает элемент сообщения
     *
     * @param {Object} user
     * @param {Object} message
     * @returns {Object}
     */
    render : function(message){
        var user = Store.getUser(message.user) || {};
        var username = user ? (user.real_name || user.name) : 'Бот какой-то';
        var isFirstInGroup = (user.id !== this._lastMessageUserId) || !this._lastMessageUserId;

        var messageBEMJSON = {
            block : 'message',
            js : true,
            mix : [{ block : 'dialog', elem : 'message' }],
            mods : { group : !isFirstInGroup },
            content : [{
                elem : 'content',
                attrs : { 'data-time' : this._getFormattedDate(message.ts) },
                content : this._parseMessage(message.text)
            }]
        };

        if(isFirstInGroup){
            messageBEMJSON.content.unshift(
                {
                    block : 'avatar',
                    user : {
                        name : username,
                        image_48 : user.profile.image_48
                    },
                    mods : { size : 'm' },
                    mix : { block : 'message', elem : 'avatar' }
                },
                {
                    elem : 'username',
                    content : username
                },
                {
                    elem : 'time',
                    content : this._getFormattedDate(message.ts)
                }
            );

            this._lastMessageUserId = user.id;
        }

        return BEMHTML.apply(messageBEMJSON);
    },

    resetLastMessage : function(){
        this._lastMessageUserId = undefined;
    },

    /**
     * Форматирование времени сообщения
     *
     * @param {Number} ts
     * @returns {String}
     * @private
     */
    _getFormattedDate : function(ts){
        var date = new Date(Math.round(ts) * 1000);
        var hours = ('0' + date.getHours()).slice(-2);
        var minutes = ('0' + date.getMinutes()).slice(-2);

        return hours + ':' + minutes;
    },

    /**
     * Парсинг сообщения
     *
     * @param {String} message
     * @returns {String}
     * @private
     */
    _parseMessage : function(message){
        message = this._parseCodes(message);
        message = this._parseSmiles(message);
        message = this._parseMarkup(message);

        return message;
    },

    /**
     * Парсинг внутренних ссылок Slack на каналы и пользователей
     *
     * @param {String} message
     * @returns {String}
     * @private
     */
    _parseCodes : function(message){
        var regex = /<(.*?)>/g;
        var sequences = [];
        var matches;

        while(matches = regex.exec(message)){
            sequences.push(matches[1]);
        }

        sequences.forEach(function(sequence){
            var pipe = sequence.indexOf('|');
            var pipedSequence = sequence;
            var id;

            if(pipe != -1){
                sequence = sequence.slice(0, pipe);
            }

            if(sequence.charAt(0) === '#'){
                id = sequence.substr(1);
                message = message.replace('<' + pipedSequence + '>', '#' + Store.getChannel(id).name);
            }else if(sequence.charAt(0) === '@'){
                id = sequence.substr(1);
                message = message.replace('<' + pipedSequence + '>', '@' + Store.getUser(id).name);
            }else if(sequence.charAt(0) === '!'){
                // Спец. команды Slack
            }else{
                message = message.replace('<' + pipedSequence + '>', BEMHTML.apply({
                    block : 'link',
                    url : sequence,
                    content : sequence,
                    target : '_blank'
                }));
            }
        });

        return message;
    },

    /**
     * Парсинг разметки
     *
     * @param {String} message
     * @returns {String}
     * @private
     */
    _parseMarkup : function(message){
        return marked(message);
    },

    /**
     * Парсинг смайликов
     *
     * @param {String} message
     * @returns {String}
     * @private
     */
    _parseSmiles : function(message){
        return emojify.replace(message, function(emoji, emojiName){
            return BEMHTML.apply({
                block : 'message',
                elem : 'smile',
                tag : 'i',
                cls : 'emoji emoji-' + emojiName
            });
        });
    }
}));

});
