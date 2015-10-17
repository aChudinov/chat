modules.define(
    'textcomplete',
    ['i-bem__dom', 'BEMHTML', 'i-store', 'jquery__textcomplete'],
    function(provide, BEMDOM, BEMHTML, Store){

        provide(BEMDOM.decl(this.name, {
            onSetMod : {
                js : {
                    inited : function(){
                        this._initTextCompletePlugin();
                    }
                }
            },

            /**
             * Инициализирует плагин автодополнения emoji-иконок
             *
             * @private
             */
            _initTextCompletePlugin : function(){
                var _this = this;
                this._textarea = this.findBlockInside('textarea');
                this._emojiList = Store.getEmojiList();

                this._textarea.domElem.textcomplete([{
                    match : /\B:([\-+\w]*)$/,

                    search : function(term, callback){
                        _this._textarea.setMod('emoji');

                        callback(_this._emojiList);
                    },

                    template : function(emoji){
                        return BEMHTML.apply([
                            {
                                block : 'textcomplete',
                                elem : 'emoji-icon',
                                tag : 'i',
                                cls : 'emoji emoji-' + emoji,
                                js : {
                                    code : emoji
                                }
                            },
                            ':' + emoji + ':'
                        ]);
                    },

                    replace : function(emoji){
                        return ':' + emoji + ': ';
                    },

                    index : 1,

                    maxCount : 10
                }]).on({
                    'textComplete:hide' : function(){
                        _this._textarea.delMod('emoji');
                    }
                });
            }
        }));
    }
);
