modules.define('emojify', ['loader_type_js'], function(provide, loader){
    loader('/static/js/emojify.js', function(){
        emojify.setConfig({
            mode : 'sprite'
        });

        provide(emojify);
    });
});
