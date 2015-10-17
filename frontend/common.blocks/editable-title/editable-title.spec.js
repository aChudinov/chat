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

        editableTitle.setVal(null, 'test');
    });

    afterEach(function(){
        BEMDOM.destruct(editableTitle.domElem);
    });

    it('should update title elem value when value changed', function(){
        editableTitle.elem('title').text().should.be.equal('test');
    });

    it('should be empty after reset', function(){
        editableTitle.reset();

        editableTitle.elem('title').text().should.be.equal('');
        editableTitle.elem('input').val().should.be.equal('');
    });

    it('should be editable only when mod active', function(){
        editableTitle.delMod('active');
        editableTitle.elem('title').click();

        editableTitle.elem('input').css('display').should.be.equal('none');
    });
});

provide();

});
