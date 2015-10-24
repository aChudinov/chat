modules.define(
    'spec',
    ['editable-title', 'i-bem__dom', 'jquery', 'BEMHTML'],
    function(provide, EditableTitle, BEMDOM, $, BEMHTML){

describe('editable-title', function(){
    var editableTitle;

    beforeEach(function(){
        editableTitle = BEMDOM.init(
            $(BEMHTML.apply({
                block : 'editable-title',
                mods : { active : true }
            })))
            .appendTo('body')
            .bem('editable-title');
    });

    afterEach(function(){
        BEMDOM.destruct(editableTitle.domElem);
    });

    it('should update title elem value when value changed', function(){
        editableTitle.setVal(null, 'test');
        editableTitle.elem('title').text().should.be.equal('test');
    });

    it('should be empty after reset', function(){
        editableTitle.setVal(null, 'test');
        editableTitle.reset();

        editableTitle.elem('title').text().should.be.equal('');
        editableTitle.elem('input').val().should.be.equal('');
    });

    it('should show input after click when active', function(){
        editableTitle.setMod('active');
        editableTitle.elem('title').trigger($.Event('click'));

        editableTitle.hasMod(editableTitle.elem('title'), 'visible').should.be.false;
        editableTitle.hasMod(editableTitle.elem('input'), 'visible').should.be.true;
    });

    it('should be editable only when mod active', function(){
        editableTitle.delMod('active');
        editableTitle.elem('title').trigger('click');

        editableTitle.hasMod(editableTitle.elem('input'), 'visible').should.be.false;
    });
});

provide();

});
