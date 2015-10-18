modules.define('speechkit', ['loader_type_js'], function(provide, loader){
    loader('//download.yandex.ru/webspeechkit/webspeechkit-1.0.0.js', function(){
        provide(ya.speechkit);
    });
});
