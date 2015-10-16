/**
 * @module message
 */
modules.define('message', ['i-bem__dom', 'BEMHTML', 'i-users'], function(provide, BEMDOM, BEMHTML, Users){

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
    render : function(user, message){
        var username = user ? (user.real_name || user.name) : 'Бот какой-то';

        return BEMHTML.apply(
            {
                block : 'message',
                js : true,
                mix : [{ block : 'dialog', elem : 'message' }],
                content : [
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
                        content : this._getSimpleDate(message.ts)
                    },
                    {
                        elem : 'content',
                        content : this._parseMessage(message.text)
                    }
                ]
            }
        );
    },

    /**
     * Форматирование времени сообщения
     *
     * @param {Number} ts
     * @returns {String}
     * @private
     */
    _getSimpleDate : function(ts){
        var date = new Date(Math.round(ts) * 1000);
        var hours = ('0' + date.getHours()).slice(-2);
        var minutes = ('0' + date.getMinutes()).slice(-2);

        return hours + ':' + minutes;
    },

    /**
     * Парсит внутренние ссылки Slack на каналы и пользователей
     *
     * @param {String} message
     * @returns {String}
     * @private
     */
    _parseMessage : function(message){
        var regex = /<(.*?)>/g;
        var sequences = [];
        var matches;

        while(matches = regex.exec(message)){
            sequences.push(matches[1]);
        }

        sequences.forEach(function(sequence){
            var pipe = sequence.indexOf('|');
            var id;

            if(pipe != -1){
                sequence = sequence.slice(0, pipe);
            }

            if(sequence.charAt(0) === '#'){
                // Канал
            }else if(sequence.charAt(0) === '@'){
                // Пользователь
                id = sequence.substr(1);

                message = message.replace(regex, '@' + Users.getUser(id).name);
            }else if(sequence.charAt(0) === '!'){
                // Спец. команды Slack
            }else{
                // Ссылка
            }
        });

        return message;
    }
}));

});
