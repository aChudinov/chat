/**
 * @module i-chat-api
 * @description Обеспечивает общение клиентской части чата и Slack RTM
 */

modules.define('i-chat-api', ['socket-io', 'jquery', 'vow', 'eventemitter2', 'lodash', 'notify'],
    function(provide, io, $, vow, EventEmitter2, _, Notify){
        var ERRORS = {
            'account_inactive' : 'Отсутствуют права на совершение действия',
            'channel_not_found' : 'Канал не найден',
            'invalid_auth' : 'Неверный токен аутентификации',
            'invalid_timestamp' : 'Неверный timestamp',
            'invalid_ts_latest' : 'Неверный timestamp',
            'invalid_ts_oldest' : 'Неверный timestamp',
            'is_archived' : 'Канал удален',
            'msg_too_long' : 'Слишком длинное сообщение',
            'name_taken' : 'Невозможно создать канал с данным именем',
            'no_channel' : 'Необходимо ввести название канала',
            'no_text' : 'Введите текст сообщения',
            'not_authed' : 'Ошибка передачи токена аутентификация',
            'not_in_channel' : 'У вас нет доступа к каналу',
            'rate_limited' : 'Достигнут лимит сообщений',
            'restricted_action' : 'Действие запрещено',
            'too_long' : 'Название канала должно быть не более 250 символов',
            'user_is_bot' : 'Невозможно выполнить действие от имени анонимного пользователя',
            'user_is_restricted' : 'Недостаточно прав'
        };

        var chatAPIPrototype = {
            /**
             * GET-запрос
             *
             * @param {String} action - код API метода
             * @param {Object} params - передаваемые данные
             * @return {Promise}
             */
            get : function(action, params){
                return this._connect(action, params, 'get');
            },

            /**
             * POST-запрос
             *
             * @param {String} action - код API метода
             * @param {Object} params - передаваемые данные
             * @return {Promise}
             */
            post : function(action, params){
                return this._connect(action, params, 'post');
            },

            /**
             * Аксессор к полю isOpen
             *
             * @param {Boolean} [isOpen]
             * @returns {Boolean} Статус соединения (открыто/закрыто)
             */
            isOpen : function(isOpen){
                if(arguments.length) {
                    return this._isOpen = isOpen;
                }

                return this._isOpen;
            },

            /**
             * Инициализация модуля
             */
            init : _.once(function(){
                this._setHandlers();
                this._getSocketURL();
            }),

            _connect : function(action, params, method){
                params = params || {};
                method = method || 'get';

                return new vow.Promise(function(resolve, reject){
                    $.get('/csrfToken')
                        .done(function(data){
                            var url = '/slack/' + action;

                            $.extend(params, { _csrf : data._csrf });

                            io.socket[method](url, params, function(resData, jwres){
                                var data = resData.data;

                                if(!resData || !data || jwres.statusCode !== 200) {
                                    reject('Ошибка подключения к API');

                                    return;
                                }

                                if(!data.ok && data.error){
                                    reject(ERRORS[data.error] || 'Неизвестная ошибка');
                                }

                                resolve(data);
                            });
                        })
                        .fail(function(err){
                            reject(err);
                        });
                });
            },

            _setHandlers : function(){
                var events = this._internalEvents;

                for (var event in events) {
                    if(events.hasOwnProperty(event)) {
                        this.on(event, events[event]);
                    }
                }
            },

            _internalEvents : {
                'connection-open' : function(){

                },

                'connection-close' : function(response){
                    console.error('Socket.close');
                },

                'connection-abort' : function(response){
                    console.error('Socket.abort');
                },

                'connection-error' : function(error){
                    console.log('Socket.connection.error');
                }
            },

            _isOpen : false,

            _getSocketURL : function(){
                var _this = this;

                this.post('rtm.start')
                    .then(function(result){
                        _this.emit('rtm.start', result);

                        if(!result.ok) {
                            throw new Error(result);
                        }

                        if(!result.url) {
                            throw new Error('URL для создания socket-соединения не найден!');
                        }

                        _this.isOpen(true);
                        _this._initSocket(result.url);
                    })
                    .catch(function(error){
                        Notify.error(error, 'Ошибка подключения RTM');
                    });
            },

            _initSocket : function(url){
                var _this = this;
                this._socket = new WebSocket(url);

                this._socket.onopen = function(){
                    _this.emit('connection-open');
                };

                this._socket.onclose = function(event){
                    var response = {
                        code : event.code,
                        reason : event.reason
                    };

                    _this.isOpen(false);

                    if(event.wasClean) {
                        _this.emit('connection-close', response);
                    } else {
                        _this.emit('connection-abort', response);
                    }
                };

                this._socket.onmessage = function(event){
                    var response = JSON.parse(event.data);

                    _this.emit(response.type, response);
                };

                this._socket.onerror = function(error){
                    _this.emit('connection-error', error.message);
                };
            }
        };

        var chatAPI = $.extend({}, chatAPIPrototype, new EventEmitter2({
            wildcard : true
        }));

        provide(/** @exports */chatAPI);
    });
