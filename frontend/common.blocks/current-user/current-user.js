modules.define(
    'current-user',
    ['i-bem__dom', 'speech', 'notify', 'difflib'],
    function(provide, BEMDOM, Speech, Notify, difflib){
        provide(BEMDOM.decl(this.name, {
            onSetMod : {
                'js' : {
                    'inited' : function(){
                        Speech.on('exit', function(e, data){
                            var text = data.text.toLowerCase();
                            var similarity = new difflib.SequenceMatcher(null, 'да', text).quickRatio();

                            if(similarity > 0.5){
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
