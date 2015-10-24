modules.define(
    'spec',
    ['editable-title', 'i-bem__dom', 'jquery', 'BEMHTML', 'keyboard__codes'],
    function(provide, EditableTitle, BEMDOM, $, BEMHTML, keyCodes){

describe('editable-title', function(){
    var editableTitle;

    beforeEach(function(){
        editableTitle = BEMDOM.init(
            $(BEMHTML.apply({
                block : 'editable-title'
            })))
            .appendTo('body')
            .bem('editable-title');
    });

    afterEach(function(){
        BEMDOM.destruct(editableTitle.domElem);
    });

    it('should update title elem on change or reset', function(){
        editableTitle.setVal(null, 'test', true);
        editableTitle.elem('title').text().should.be.equal('test');

        editableTitle.reset();
        editableTitle.elem('title').text().should.be.equal('');
        editableTitle.elem('input').val().should.be.equal('');
    });

    it('should show input after click when active', function(){
        editableTitle.setVal(null, 'test', true);
        editableTitle.hasMod('active').should.be.true;

        editableTitle.elem('title').trigger($.Event('click'));
        editableTitle.hasMod(editableTitle.elem('title'), 'visible').should.be.false;
        editableTitle.hasMod(editableTitle.elem('input'), 'visible').should.be.true;
    });

    it('shouldn\'t be editable when mod is not active', function(){
        editableTitle.setVal(null, 'test', false);
        editableTitle.hasMod('active').should.be.false;

        editableTitle.elem('title').trigger($.Event('click'));
        editableTitle.hasMod(editableTitle.elem('input'), 'visible').should.be.false;
    });

    it('should cancel on ESC press', function(){
        var e = $.Event('keydown', { keyCode : keyCodes.ESC });

        editableTitle.setVal(null, 'test', true);
        editableTitle.elem('title').trigger($.Event('click'));
        editableTitle.findBlockInside('input').domElem.trigger(e);

        editableTitle.hasMod(editableTitle.elem('input'), 'visible').should.be.false;
    });
});

provide();

});
