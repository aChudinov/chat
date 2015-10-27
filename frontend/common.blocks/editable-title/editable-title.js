/**
 * @module Editable-input
 */
modules.define(
    'editable-title',
    ['i-bem__dom', 'i-chat-api', 'keyboard__codes', 'notify'],
    function(provide, BEMDOM, chatAPI, keyCodes, Notify){
        /**
         * @exports
         * @class editable-input
         */
        provide(BEMDOM.decl(this.name, {
            onSetMod : {
                'js' : {
                    'inited' : function(){
                        this._title = this.elem('title');
                        this._input = this.elem('input');
                        this._spin  = this.elem('spin');
                    }
                },
                'active' : function(modName, modVal){
                    if(modVal){
                        this.findBlockInside('input').bindTo('keydown', this._handleInputKeyDown.bind(this));
                        this.bindTo('title', 'click', this._handleTitleClick);
                    }else{
                        this.unbindFrom('title', 'click');
                        this.findBlockInside('input').unbindFrom('keydown');
                    }
                }
            },

            /**
             * Устанавливает значение для заголовка
             *
             * @param {String} value - Значение заголовка
             * @param {Boolean} isActive - Делать ли заголовок изменяемым при клике
             * @returns {Object}
             */
            setVal : function(channelId, value, isActive){
                if(!value && isActive){
                    value = 'Без названия';
                    this.setMod('empty');
                }else{
                    this.delMod('empty');
                }

                this.setMod('active', isActive);
                this._title.text(value);
                this._channelId = channelId;

                return this;
            },

            /**
             * Обнуляет состояние блока
             *
             * @returns {Object}
             */
            reset : function(){
                this.setMod(this._title, 'visible');
                this.delMod(this._input, 'visible');
                this._input.val('');
                this._title.text('');

                return this;
            },

            /**
             * Обработка клика на заголовке
             *
             * @private
             */
            _handleTitleClick : function(){
                this.setMod(this._input, 'visible');
                this.delMod(this._title, 'visible');

                this._input.find('input')
                    .val(this._title.text())
                    .focus();
            },

            /**
             * Обработка нажатия на клавиши при фокусе в инпуте
             *
             * @param {Event} e - объект события
             * @private
             */
            _handleInputKeyDown : function(e){
                var value = e.target.value;

                if(e.keyCode === keyCodes.ENTER && this._validateInput(value)){
                    this._saveTitle(value);
                }else if(e.keyCode === keyCodes.ESC){
                    this.delMod(this._input, 'visible');
                    this.setMod(this._title, 'visible');
                }
            },

            /**
             * Валидация инпута, при ошибке показывается Notify
             *
             * @param {String} value - Новое значение заголовка
             * @returns {Boolean} - Результат валидации инпута
             * @private
             */
            _validateInput : function(value){
                if(!value){
                    Notify.info('Введите тему канала');
                }

                return Boolean(value);
            },

            /**
             * Метод для сохранения нового значения названия заголовка
             *
             * @param {String} value - Новое значение заголовка
             * @private
             */
            _saveTitle : function(value){
                var _this = this;

                this.findBlockInside('input').setMod('disabled');
                this.delMod(this._input, 'visible');
                this.setMod(this._spin, 'visible');

                return chatAPI.post('channels.setTopic', {
                    channel : this._channelId,
                    topic : value
                })
                    .then(function(resData){
                        var newTitle = resData.topic;

                        if (newTitle){
                            _this._title.text(newTitle);
                            _this.delMod('empty');
                            _this.emit('title-changed', { newTitle : newTitle });
                        }
                    })
                    .catch(function(error){
                        Notify.error(error, 'Ошибка изменения темы канала');
                    })
                    .always(function(){
                        _this.setMod(_this._title, 'visible');
                        _this.delMod(_this._spin, 'visible');
                        _this.findBlockInside('input').delMod('disabled');
                    });
            }
        }));
    }
);
