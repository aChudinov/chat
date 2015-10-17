modules.define('lodash', ['loader_type_js'], function(provide, loader){
    loader('https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash.min.js', function(){
        provide(_);
    });
});
