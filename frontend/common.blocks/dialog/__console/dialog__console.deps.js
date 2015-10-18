({
    mustDeps : [
        {
            block : 'popup',
            mods : {
                theme : 'islands',
                target : 'anchor',
                directions : ['bottom-left'],
                direction : 'left-center',
                autoclosable : true,
                visible : false
            }
        },
        { block : 'textarea', mods : { theme : 'islands', size : 'm', focused : true, name : 'msg' } },
        { block : 'button', mods : { theme : 'islands', view : 'plain' } },
        { block : 'i-chat-api' },
        { block : 'menu', mods : { theme : 'islands', size : 'm' } }
    ],
    shouldDeps : [
        { block : 'i-chat-api' },
        { block : 'chat-input' },
        { elems : ['emoji', 'speech'] },
        { block : 'chat-input', elem : 'emoji-button' },
        { block : 'menu-item' },
        { block : 'textcomplete' },
        { block : 'speech' }
    ]
});
