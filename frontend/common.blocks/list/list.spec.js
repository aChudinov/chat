modules.define(
    'list',
    ['list', 'i-bem__dom', 'jquery', 'BEMHTML'],
    function(provide, List, BEMDOM, $, BEMHTML){

describe('list', function(){
    var list;

    beforeEach(function(){
        list = BEMDOM.init(
            $(BEMHTML.apply({
                block : 'list'
            })))
            .appendTo('body')
            .bem('list');
    });

    afterEach(function(){
        BEMDOM.destruct(list.domElem);
    });

    it('should show and focus input on add button click', function(){

    });
});

provide();

});
