modules.define('page', ['i-bem__dom', 'i-chat-api', 'socket-io', 'i-store', 'header'],
    function(provide, BEMDOM, chatAPI, io, Store, Header){
        provide(BEMDOM.decl(this.name, {
            onSetMod : {
                'js' : {
                    'inited' : function(){
                        var _this = this;

                        if(!this.hasMod('logged')) {
                            return;
                        }

                        io.socket = io.sails.connect();

                        io.socket.on('connect', function(){
                            setTimeout(function(){
                                io.socket.get('/csrfToken', function(data){
                                    io.socket.get('/webrtc/connected', { _csrf : data._csrf });
                                });
                            }, 0);
                        });

                        io.socket.on('activeUsersUpdated', function(users){
                            _this._activeUsersUpdated = users;
                            _this.emit('activeUsersUpdated', users);
                        });

                        io.socket.on('slackInited', function(){
                            if(!chatAPI.isOpen()) {
                                chatAPI.init();
                            }

                            Store.fetchUsers().catch(function(){
                                Notify.error('Ошибка загрузки списка пользователей!');
                            });

                            _this.emit('slackInited');
                        });

                        Header.on('menu-toggle', function(e, data){
                            var sidebar = _this.elem('sidebar');

                            data.visible ? _this.setMod(sidebar, 'hidden') : _this.delMod(sidebar, 'hidden');
                        });
                    }
                }
            }
        }));
    }
);
