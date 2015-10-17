modules.define(
    'chat-input',
    ['i-bem__dom', 'BEMHTML', 'i-store', 'jquery'],
    function(provide, BEMDOM, BEMHTML, Store, $){
        provide(BEMDOM.decl(this.name, {
            onSetMod : {
                js : {
                    inited : function(){
                        this._textarea = this.findBlockInside('textarea');
                        this._popup = this.findBlockInside('popup');
                        this._emojiButton = this.findBlockInside('button');

                        this._initEmojiPopup();
                        this._generateEmojis();

                        this.bindTo('emoji-icon', 'click', this._onEmojiClick.bind(this));
                    }
                }
            },

            _initEmojiPopup : function(){
                this._popup.setAnchor(this._emojiButton);
                this._popup.setContent(BEMHTML.apply({
                    block : 'menu',
                    mods : { theme : 'islands', size : 'm' },
                    content : this._generateEmojis()
                }));

                this._emojiButton.on('click', function(){
                    this._togglePopup();
                }.bind(this));
            },

            /**
             * Формирует BEMJSON со всеми emoji-иконками
             *
             * @private
             */
            _generateEmojis : function(){
                var emojiIconsBEMJSON = [];

                Store.getEmojiList().forEach(function(emoji){
                    emojiIconsBEMJSON.push({
                        block : 'chat-input',
                        elem : 'emoji-icon',
                        tag : 'i',
                        cls : 'emoji emoji-' + emoji,
                        js : {
                            code : emoji
                        }
                    });
                });

                return emojiIconsBEMJSON;
            },

            _togglePopup : function(){
                var modStatus = this._popup.getMod('visible');
                this._popup.setMod('visible', !modStatus);
            },

            _onEmojiClick : function(e){
                var emojiIcon = $(e.target);
                var emojiCode = this.elemParams(emojiIcon).code;

                this._textarea.setVal(this._textarea.getVal() + ':' + emojiCode + ':');
                this._textarea.setMod('focused', true);
                this._togglePopup();
            }
        }));
    }
);
