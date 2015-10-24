modules.define(
    'dialog',
    ['i-bem__dom', 'BEMHTML', 'socket-io', 'i-chat-api', 'i-store', 'user', 'list', 'speech',
        'message', 'keyboard__codes', 'jquery', 'notify', 'functions__throttle'],
    function(provide, BEMDOM, BEMHTML, io, chatAPI, Store, User, List, Speech, Message, keyCodes, $, Notify, throttle){
        var EVENT_METHODS = {
            'channels' : 'channels',
            'users' : 'im'
        };

        provide(BEMDOM.decl(this.name, {
            onSetMod : {
                'js' : {
                    'inited' : function(){
                        this._textarea = this.findBlockInside('textarea');
                        this._container = this.elem('container');

                        Store.subscribeMessageUpdate();

                        Store.on('message-received', this._onMessageReceive, this);
                        List.on('channel-selected', this._onChannelSelect, this);
                        User.on('click-user', this._onUserSelect, this);

                        Speech.on('write-message', function(e, data){
                            if(data && data.text){
                                this._sendMessage(data.text);
                            }
                        }, this);

                        this._textarea.bindTo('keydown', this._onConsoleKeyDown.bind(this));
                        this.bindTo('history', 'wheel DOMMouseScroll mousewheel', this._onHistoryScroll);
                    }
                }
            },

            destruct : function(){
                Store.un('message-received');
                List.un('channel-selected');
                User.un('click-user');
                Speech.un('write-message');
            },

            /**
             * Обработка новых сообщений, пришедших через RTM
             *
             * @param {Event} e
             * @param {Object} data
             * @private
             */
            _onMessageReceive : function(e, data){
                if(this._channelId && data.channel === this._channelId){
                    BEMDOM.append(this._container, Message.render(data));
                    this._scrollToBottom();
                }
            },

            /**
             * Обработка события клика на пользователя в списке
             *
             * @param {Event} e
             * @param {Object} userParams
             * @private
             */
            _onUserSelect : function(e, userParams){
                var dialogControlBlock = this.findBlockInside('dialog-controls');
                var callButton = dialogControlBlock.findElem('call');

                if(userParams.presence !== 'local') {
                    dialogControlBlock.setMod(callButton, 'disabled');

                    return;
                }

                dialogControlBlock.delMod(callButton, 'disabled');
                callButton.data('slackId', userParams.userId);
            },

            /**
             * Обработка события выбора канала
             *
             * @param {Event} e
             * @param {Object} data
             * @private
             */
            _onChannelSelect : function(e, data){
                var params = data.params;

                Store.setConsoleMessage(this._channelId, this._textarea.getVal());

                this._channelId = params.channelId;
                this._channelType = EVENT_METHODS[data.type];
                this._tsOffset = 0;

                this.elem('name').text(params.name);
                this.findBlockInside('editable-title')
                    .reset()
                    .setVal(this._channelId, params.title, (data.type == 'channels'));

                this.setMod(this.elem('name'), 'type', data.type);
                this.findBlockInside('dialog-controls').setMod('type', data.type);

                BEMDOM.update(this._container, []);
                this.setMod(this.elem('spin'), 'visible');
                this.dropElemCache('message');

                this._getData().then(function(){
                    var textareaValue = Store.getConsoleMessage(this._channelId);

                    this._textarea.setVal(textareaValue);
                }.bind(this));
            },

            /**
             * Обработка сролла истории сообщений для подгрузки истории
             */
            _onHistoryScroll : throttle(function(){
                var history = this.elem('history');

                if(
                    !(this.elem('message').length < 100) &&
                    !this.getMod(this.elem('spin'), 'visible') &&
                    !this.elem('blank').is(':visible') &&
                    history.scrollTop() === 0
                ){
                    this.setMod(this.elem('spin'), 'visible');
                    this._getData(true);
                }
            }, 500),

            /**
             * Пометка сообщений канала прочитанными
             *
             * @param {Number} timestamp
             * @private
             */
            _markChannelRead : function(timestamp){
                chatAPI.post(this._channelType + '.mark', {
                    channel : this._channelId,
                    ts : timestamp
                }).catch(function(error){
                    Notify.error(error, 'Ошибка при открытии канала');
                });
            },

            /**
             * Загрузка истории сообщений выбранного канала
             *
             * @param {Boolean} infiniteScroll - загрузка данных при скролле
             * @private
             */
            _getData : function(infiniteScroll){
                var _this = this;

                this._scrollHeight = this.elem('history')[0].scrollHeight;
                this._textarea.setMod('disabled');
                this.elem('blank').hide();

                return chatAPI.post(this._channelType + '.history', {
                    channel : this._channelId,
                    latest : infiniteScroll ? this._tsOffset : 0
                })
                    .then(function(resData){
                        var messages = resData.messages.reverse();
                        var messagesList = messages.map(function(message){
                            return Message.render(message);
                        });

                        if(messages.length){
                            _this._markChannelRead(messages[messages.length - 1].ts);

                            _this._tsOffset = messages[0].ts;
                        }else{
                            _this.elem('blank').show();
                        }


                        if(infiniteScroll){
                            BEMDOM.prepend(_this._container, messagesList.join(''));
                        }else{
                            BEMDOM.update(_this._container, messagesList);
                        }

                        _this._scrollToBottom();
                    })
                    .catch(function(error){
                        Notify.error(error, 'Ошибка загрузки списка сообщений');
                    })
                    .always(function(){
                        _this.delMod(_this.elem('spin'), 'visible');
                        _this._textarea.delMod('disabled');
                    });
            },

            /**
             * Скролл содержимого диалога вниз на загруженное количество сообщений
             *
             * @private
             */
            _scrollToBottom : function(){
                var historyElement = this.elem('history');
                var scrollHeight;

                if(historyElement.length){
                    scrollHeight = historyElement[0].scrollHeight - this._scrollHeight;
                    $(historyElement).scrollTop(scrollHeight);
                }
            },

            /**
             * Обработчик нажатия на клавишу Enter
             *
             * @param {Event} e
             * @private
             */
            _onConsoleKeyDown : function(e){
                if(e.keyCode === keyCodes.ENTER){
                    e.preventDefault();

                    if(e.ctrlKey || e.metaKey || e.shiftKey){
                        this._textarea.setVal(this._textarea.getVal() + '\n');
                    }else{
                        if(!this._textarea.hasMod('emoji')){
                            this._sendMessage(e.target.value);
                            e.target.value = '';
                        }
                    }
                }
            },

            /**
             * Отправка сообщения в текущий активный канал
             *
             * @param {String} message
             * @private
             */
            _sendMessage : function(message){
                var _this = this;

                if(!this._channelId) {
                    return;
                }

                chatAPI.post('chat.postMessage', {
                    text : message,
                    channel : this._channelId,
                    username : this.params.username,
                    as_user : true
                })
                    .then(function(){
                        _this.elem('blank').hide();
                    })
                    .catch(function(error){
                        Notify.error(error, 'Ошибка при отправке сообщения');
                    });
            }
        }));
    }
);
