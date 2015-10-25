modules.define(
    'spec',
    ['adding-input', 'i-bem__dom', 'jquery', 'BEMHTML', 'keyboard__codes'],
    function(provide, AddingInput, BEMDOM, $, BEMHTML, keyCodes){

describe('adding-input', function(){
    var addingInput;

    beforeEach(function(){
        addingInput = BEMDOM.init(
            $(BEMHTML.apply({
                block : 'adding-input'
            })))
            .appendTo('body')
            .bem('adding-input');
    });

    afterEach(function(){
        BEMDOM.destruct(addingInput.domElem);
    });

    it('should show and focus input on add button click', function(){
        addingInput.elem('button').trigger($.Event('click'));

        addingInput.hasMod(addingInput.elem('input'), 'visible').should.be.true;
        addingInput.hasMod(addingInput.elem('button'), 'open').should.be.true;
    });

    it('should prevent default action on Enter press', function(){
        addingInput.elem('button').trigger($.Event('click'));

        var e = $.Event('keydown', { keyCode : keyCodes.ENTER });

        addingInput.findBlockInside('input').domElem.trigger(e);

        e.isDefaultPrevented().should.be.true;
    });

    it('should reset after save', function(){
        addingInput.elem('button').trigger($.Event('click'));
        addingInput._reset();

        addingInput.hasMod(addingInput.elem('input'), 'visible').should.be.false;
        addingInput.hasMod(addingInput.elem('button'), 'open').should.be.false;
    });
});

provide();

});
