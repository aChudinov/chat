modules.define(
    'current-user',
    ['i-bem__dom', 'speech', 'notify'],
    function(provide, BEMDOM, Speech, Notify){
        provide(BEMDOM.decl(this.name, {
            onSetMod : {
                'js' : {
                    'inited' : function(){
                        Speech.on('exit', function(e, data){
                            if(data && data.text && data.text.trim().toLowerCase() === 'да'){
                                location.href = '/logout';
                            }else{
                                Notify.warning('Выход отменен');
                            }
                        });
                    }
                }
            }
        }));
    }
);
