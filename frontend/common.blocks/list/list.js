modules.define(
    'list',
    ['i-bem__dom', 'BEMHTML', 'jquery', 'i-chat-api', 'i-store',
        'notify', 'keyboard__codes', 'editable-title', 'adding-input', 'message'],
    function(provide, BEMDOM, BEMHTML, $, chatAPI, Store, Notify, keyCodes, EditableTitle, AddingInput, Message){
        provide(BEMDOM.decl(this.name, {
            onSetMod : {
                'js' : {
                    'inited' : function(){
                        var instances = this.__self.instances || (this.__self.instances = []);
                        instances.push(this);

                        this._container = this.elem('container');
                        this._spin = this.elem('spin');

                        if(this._spin) {
                            this.setMod(this._spin, 'visible');
                        }

                        Store.on('users-loaded', this._initializeLists, this);
                        Store.on('message-received', this._onMessageReceive, this);
                        EditableTitle.on('title-changed', this._onChannelChangeTitle, this);
                        AddingInput.on('channel-created', this._onChannelCreate, this);
                        Message.on('channel-referenced', this._selectChannelById, this);
                    }
                }
            },

            destruct : function(){
                Store.un('users-loaded');
                Store.un('message-received');
                EditableTitle.un('title-changed');
                AddingInput.un('channel-created');
            },

            /**
             * Обработка новых сообщений, пришедших через RTM
             *
             * @param {Event} e
             * @param {Object} data
             * @private
             */
            _onMessageReceive : function(e, data){
                var counter = this._getItemCounter(data.channel);

                if(data.channel !== this._selectedChannelId){
                    if(counter){
                        counter.text(Number(counter.text()) + 1);
                    }

                    this.dropElemCache('item');
                }
            },

            /**
             * Открытие канала по идентификатору
             *
             * @param {String} id
             */
            _selectChannelById : function(e, data){
                var channelId = (typeof data === 'object') ? data.channelId : e;

                this.findElem('item').each(function(index, item){
                    if(this.elemParams($(item)).channelId === channelId){
                        $(item).click();
                    }
                }.bind(this));
            },

            /**
             * Получаем каналы и итерируемся по каждому с целью
             * простановки счетчика непрочитнных сообщений
             *
             * @param {String} channelId - ID канала
             * @returns {Object} - Элемент counter счетчика непрочитанных сообщений канала
             *
             * @private
             */
            _getItemCounter : function(channelId){
                var counterElem;

                this.elem('item').each(function(index, item){
                    var itemParams = this.elemParams($(item));

                    if(itemParams.channelId === channelId) {
                        counterElem = $(this.findElem('counter')[index]);
                    }
                }.bind(this));

                return counterElem;
            },

            /**
             * Инициализация списка
             *
             * @returns {Promise}
             * @private
             */
            _initializeLists : function(){
                var _this = this;
                var type = this.getMod('type');

                if(type === 'channels'){
                    return Store.fetchChannels().then(function(){
                        _this._renderChannels();
                    });
                }else if(type === 'users'){
                    chatAPI.on('rtm.start', function(result){
                        var usersStatusOnStart = {};

                        result.users.forEach(function(user){
                            usersStatusOnStart[user.id] = user.presence;
                        });

                        return Store.fetchIms().then(function(){
                            _this._renderIms(usersStatusOnStart);
                        });
                    });
                }
            },

            /**
             * Рендеринг списка каналов
             *
             * @private
             */
            _renderChannels : function(){
                var channels = Store.getChannels();
                var selectedChannelIndex;

                var channelsList = channels.map(function(channel, index){
                    if(channel.is_general) {
                        selectedChannelIndex = index;
                    }

                    if(channel.name === location.hash.slice(1)) {
                        selectedChannelIndex = index;
                    }

                    return BEMHTML.apply({
                        block : 'list',
                        elem : 'item',
                        mods : { type : 'channels' },
                        content : channel.name,
                        js : {
                            channelId : channel.id,
                            name : channel.name,
                            title : channel.topic.value,
                            isMember : channel.is_member
                        }
                    });
                });

                BEMDOM.update(this._container, channelsList);

                this.elem('item')[selectedChannelIndex].click();
                this.delMod(this._spin, 'visible');
            },

            /**
             * Рендеринг списка приватных бесед
             *
             * @param usersStatusOnStart
             * @private
             */
            _renderIms : function(usersStatusOnStart){
                var _this = this;
                var pageBlock = this.findBlockOutside('page');
                var ims = Store.getIms();

                var imsList = ims.map(function(im){
                    var user = Store.getUser(im.user);

                    if(!user) {
                        return;
                    }

                    var presence = usersStatusOnStart[user.id];
                    if(presence) {
                        user.presence = usersStatusOnStart[user.id];
                    }

                    return BEMHTML.apply({
                        block : 'list',
                        elem : 'item',
                        mods : { type : 'users' },
                        js : {
                            channelId : im.id,
                            userId : im.user,
                            name : user.name,
                            title : user.real_name
                        },
                        content : {
                            block : 'user',
                            js : { userId : user.id },
                            mods : { presence : user.presence },
                            user : {
                                name : user.name,
                                realName : user.real_name,
                                image_48 : user.profile.image_48
                            }
                        }
                    });
                });

                BEMDOM.update(this._container, imsList);
                this._updateUsersStatus('activeUsersUpdated', pageBlock._activeUsersUpdated);
                this.delMod(this._spin, 'visible');

                pageBlock.on('activeUsersUpdated', function(e, data){
                    _this._updateUsersStatus('activeUsersUpdated', data);
                });

                chatAPI.on('presence_change', function(data){
                    _this._updateUsersStatus('presence_change', data);
                });
            },

            /**
             * Обновление статусов пользователей в списке
             *
             * @param {String} name
             * @param {Object} data
             * @private
             */
            _updateUsersStatus : function(name, data){
                var userElements = this.findBlocksInside('user');

                userElements.forEach(function(user){
                    if(name === 'activeUsersUpdated'){
                        if(data[user.params.id]){
                            user.setMod('presence', 'local');
                        } else if(user.hasMod('presence', 'local')){
                            chatAPI.get('users.getPresence', { user : user.params.id })
                                .then(function(data){
                                    data.ok && user.setMod('presence', data.presence);
                                })
                                .catch(function(error){
                                    Notify.error(error, 'Ошибка загрузки статуса пользователя ' + user.params.name);
                                });
                        }
                    }else if(name === 'presence_change'){
                        if(user.params.id == data.user && !user.hasMod('presence', 'local')){
                            user.setMod('presence', data.presence);
                        }
                    }
                });
            },

            /**
             * Вступление в канал с параметром is_member: false
             *
             * @param {String} name
             */
            _joinChannel : function(name){
                chatAPI.post('channels.join', { name : name })
                    .catch(function(error){
                        Notify.error(error, 'Ошибка вступления в канал ' + name);
                    });
            },

            /**
             * Callback при нажатии на элемент списка
             *
             * @param {Event} e
             * @private
             */
            _onItemClick : function(e){
                var item = $(e.currentTarget);
                var type = this.getMod(item, 'type');
                var itemParams = this.elemParams(item);
                var counter = this._getItemCounter(itemParams.channelId);

                if(type == 'channels') location.hash = itemParams.name;
                if(counter) counter.text('');

                this.__self.instances.forEach(function(list){
                    list.delMod(list.elem('item'), 'current');
                });

                this.setMod(item, 'current', true);

                this._selectedChannelId = itemParams.channelId;

                if(type == 'channels' && !itemParams.isMember){
                    this._joinChannel(itemParams.name);
                }

                this.emit('channel-selected', {
                    type : type,
                    params : itemParams
                });

                this.dropElemCache('item');
            },

            /**
             * Сallback при создании канала
             *
             * @param {Event} e
             * @param {Object} data
             * @param {Number} data.id - пришедший идентификатор после сохранения нового канала
             * @private
             */
            _onChannelCreate : function(e, data){
                this.dropElemCache('item');

                this._initializeLists()
                    .then(this._selectChannelById.bind(this, data.id));
            },

            /**
             * Callback при сохранении темы канала
             *
             * @param {Event} e
             * @param {Object} data
             * @param {String} newTitle
             * @private
             */
            _onChannelChangeTitle : function(e, data){
                var currentItem = $(this.elem('item_current'));

                if(!currentItem.length) return;

                var params = $.extend({}, this.elemParams(currentItem));
                params.title = data.newTitle;

                BEMDOM.replace(currentItem, BEMHTML.apply({
                    block : 'list',
                    elem : 'item',
                    mods : { type : 'channels', current : true },
                    content : params.name,
                    js : params
                }));

                this.dropElemCache('item');
            }
        }, {
            live : function(){
                this.liveBindTo('item', 'click', function(e){
                    this._onItemClick(e);
                });

                return false;
            }
        }));
    }
);
