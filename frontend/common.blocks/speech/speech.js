modules.define(
    'speech',
    ['i-bem__dom', 'BEMHTML', 'i-store', 'list', 'notify', 'events__channels', 'speechkit', 'lodash', 'difflib', 'vow'],
    function(provide, BEMDOM, BEMHTML, Store, List, Notify, channels, speechkit, _, difflib, vow){
        var API_KEY = 'f92ce291-973b-44e0-afa5-c77e17715be0';

        var ACTION_QUESTIONS = {
            'write-message' : 'Произнесите текст сообщения для отправки',
            'open-channel' : 'Произнесите название канала',
            'open-in' : 'Произнесите ник или ФИО собеседника',
            'exit' : 'Уверены?'
        };

        var COMMANDS_MESSAGES = [
            { action : 'write-message', commands : ['отправить сообщение', 'ввести сообщение', 'набрать сообщение', 'напечатать сообщение', 'новое сообщение'] },
            { action : 'open-channel', commands : ['открыть канал', 'войти в канал'] },
            { action : 'open-in', commands : ['открыть приватную беседу', 'выбрать собеседника'] },
            { action : 'exit', commands : ['выйти', 'выход', 'разлогиниться', 'логаут'] }
        ];

        provide(BEMDOM.decl(this.name, {
            onSetMod : {
                'js' : {
                    'inited' : function(){
                        this.bindTo('click', this._handleClick.bind(this));
                    }
                }
            },

            _handleClick : function(){
                this._requestSpeech()
                    .then(this._firstCommand)
                    .then(this._secondCommand.bind(this))
                    .then(this._emitAction.bind(this))
                    .fail(function(){
                        Notify.warning('Ошибка выполнения команды, попробуйте еще раз');
                    })
                    .always(function(){
                        this.delMod('loading');
                    }.bind(this));
            },

            _firstCommand : function(text){
                var action;

                text = text.trim().toLowerCase();

                _.find(COMMANDS_MESSAGES, function(message){
                    _.find(message.commands, function(command){
                        var similarity = new difflib.SequenceMatcher(null, command, text).quickRatio();

                        if(similarity > 0.85){
                            action = message.action;

                            return true;
                        }
                    });
                });

                if(!action){
                    return vow.reject();
                }

                return action;
            },

            _secondCommand : function(action){
                this._action = action;

                return this._requestSpeech(ACTION_QUESTIONS[action]);
            },

            _emitAction : function(text){
                this.emit(this._action, { text : text });
            },

            _requestSpeech : function(command, model){
                var deferred = vow.defer();

                command = command || 'Произнесите команду';
                model = model || 'freeform';

                this.setMod('loading');

                speechkit.recognize({
                    model : model,
                    lang : 'ru-RU',
                    apiKey : API_KEY,

                    doneCallback : function(text){
                        deferred.resolve(text);
                    },

                    initCallback : function(){
                        Notify.info(command);
                    },

                    errorCallback : function(error){
                        deffered.reject();
                        Notify.error('Ошибка при распознавании команды: ', error);
                    }
                });

                return deferred.promise();
            }
        }));
    }
);
