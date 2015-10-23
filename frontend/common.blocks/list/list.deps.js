({
    mustDeps : [
        { block : 'spin', mods : { theme : 'shriming', size : 's' } }
    ],
    shouldDeps : [
        { elems : ['title', 'container', 'item', 'spin', 'counter'] },
        { block : 'avatar' },
        { block : 'i-chat-api' },
        { block : 'list', elem : 'item', mods : { type : ['channels', 'users'] } },
        { block : 'user' },
        { block : 'notify' },
        { block : 'keyboard', elem : 'codes' },
        { block : 'adding-input' }
    ]
});
