/**
 * @module message
 */
modules.define('message',
    ['i-bem__dom', 'BEMHTML', 'i-store', 'emojify', 'marked'],
function(provide, BEMDOM, BEMHTML, Store, emojify, marked){
    var MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября' ,'ноября' ,'декабря'];

/**
 * @exports
 * @class message
 */
provide(BEMDOM.decl(this.name, {
    onSetMod : {
        'js' : {
            'inited' : function(){
                this._modal = this.findBlockInside('modal');
                this.bindTo('image', 'click', this._onImageClick);
            }
        }
    },

    /**
     * Увеличение изображения при клике
     *
     * @private
     */
    _onImageClick : function(){
        this._modal.setMod('visible', true);
    }
}, {

    /**
     * Возвращает элемент сообщения
     *
     * @param {Object} message
     * @returns {Object}
     */
    render : function(message){
        var user = Store.getUser(message.user) || {};
        var username = user ? (user.real_name || user.name) : 'Бот какой-то';
        var isFirstInGroup = (user.id !== this._lastMessageUserId) || !this._lastMessageUserId;
        var messageDate = new Date(Math.round(message.ts) * 1000).getDate();
        var hasDate = (this._lastMessageDate != messageDate) || !this._lastMessageDate;

        var messageBEMJSON = [{
            block : 'message',
            js : true,
            mix : [{ block : 'dialog', elem : 'message' }],
            mods : { group : !isFirstInGroup && !hasDate },
            content : [{
                elem : 'content',
                attrs : { 'data-time' : this._getFormattedTime(message.ts) },
                content : this._parseMessage(message)
            }]
        }];

        if(isFirstInGroup || hasDate){
            messageBEMJSON[0].content.unshift(
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
                    content : this._getFormattedTime(message.ts)
                }
            );

            this._lastMessageUserId = user.id;
        }

        if(hasDate){
            messageBEMJSON.unshift({
                block : 'message',
                elem : 'delimiter',
                content : {
                    block : 'message',
                    elem : 'date',
                    tag : 'span',
                    content : this._getFormattedDate(message.ts)
                }
            });
        }

        this._lastMessageDate = messageDate;

        return BEMHTML.apply(messageBEMJSON);
    },

    /**
     * Сбросить данные последнего сообщения в группе. Выполняется при смене канала
     */
    resetLastMessage : function(){
        this._lastMessageUserId = undefined;
        this._lastMessageTs = undefined;
    },

    /**
     * Форматирование времени сообщения
     *
     * @param {Number} ts
     * @returns {String}
     * @private
     */
    _getFormattedTime : function(ts){
        var date = new Date(Math.round(ts) * 1000);
        var hours = ('0' + date.getHours()).slice(-2);
        var minutes = ('0' + date.getMinutes()).slice(-2);

        return hours + ':' + minutes;
    },

    _getFormattedDate : function(ts){
        var date = new Date(Math.round(ts) * 1000);
        var day = date.getDate();
        var month = date.getMonth();
        var year = date.getFullYear();

        var today = new Date();
        var yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if(day === today.getDate() && month === today.getMonth() && year === today.getFullYear()){
            return 'Сегодня';
        }

        if(day === yesterday.getDate() && month === yesterday.getMonth() && year === yesterday.getFullYear()){
            return 'Вчера';
        }

        return day + ' ' + MONTHS[month] + ' ' + year + ' года';
    },

    /**
     * Парсинг сообщения
     *
     * @param {String} message
     * @returns {String}
     * @private
     */
    _parseMessage : function(message){
        var messageText = message.text;

        if(message.upload && message.file && message.file.mimetype.indexOf('image/') === 0){
            return this._parseImage(message.file);
        }

        messageText = this._parseCodes(messageText);
        messageText = this._parseSmiles(messageText);
        messageText = this._parseMarkup(messageText);

        return messageText;
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
                message = message.replace('<' + pipedSequence + '>', pipedSequence.slice(1));
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
    },

    /**
     * Вставка в сообщение превью загруженного изображения
     *
     * @param {Object} fileData
     * @returns {Object}
     * @private
     */
    _parseImage : function(fileData){
        return BEMHTML.apply([
            {
                block : 'image',
                mix : { block : 'message', elem : 'image' },
                url : fileData.thumb_360,
                alt : fileData.title,
                title : fileData.title,
                width : fileData.thumb_360_w,
                height : fileData.thumb_360_h
            },
            {
                block : 'modal',
                js : { visible : false },
                mods : { autoclosable : true, theme : 'islands' },
                content : {
                    block : 'image',
                    mix : { block : 'message', elem : 'image' },
                    url : fileData.url,
                    alt : fileData.title,
                    title : fileData.title,
                    width : fileData.original_w,
                    height : fileData.original_h
                }
            }
        ]);
    }
}));

});
