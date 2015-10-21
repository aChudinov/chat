modules.define(
    'adding-input',
    ['i-bem__dom', 'i-chat-api', 'keyboard__codes'],
    function(provide, BEMDOM, chatAPI, keyCodes){

        provide(BEMDOM.decl(this.name, {
            onSetMod : {
                'js' : {
                    'inited' : function(){
                        this._button = this.elem('button');
                        this._input = this.elem('input');
                        this._spin = this.elem('spin');

                        this.bindTo('button', 'click', this._handleButtonClick);
                        this.findBlockInside('input').bindTo('keydown', this._handleInputKeydown.bind(this));
                    }
                }
            },

            /**
             * Обработчик клика на кнопку "Добавить"
             *
             * @private
             */
            _handleButtonClick : function(){
                this.toggleMod(this._input, 'visible');
                this.toggleMod(this._button, 'open');

                this._input.find('input').focus();
            },

            /**
             * Обработчик нажатия на клавишу Enter
             *
             * @param {Event} e
             * @private
             */
            _handleInputKeydown : function(e){
                if(e.keyCode === keyCodes.ENTER) {
                    e.preventDefault();

                    this._saveValue(e.target.value);
                }
            },

            /**
             * Сброс состояния блока
             *
             * @private
             */
            _reset : function(){
                this.findBlockInside('input').domElem.find('input').val('');
                this.delMod(this._input, 'visible');
                this.delMod(this._button, 'open');
            },

            /**
             * Сохранение значения
             *
             * @param {String} value
             * @private
             */
            _saveValue : function(value){
                var _this = this;

                this.setMod(this._spin, 'visible');
                this.delMod(this._input, 'visible');

                chatAPI.post(this.params.method, { name : value })
                    .then(function(resData){
                        _this._reset();
                        _this.emit('channel-created', { id : resData.channel.id });
                    })
                    .always(function(){
                        _this.delMod(_this._spin, 'visible');
                    });
            },
        }));
    }
);
