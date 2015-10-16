({
    mustDeps : [
        { block : 'input', mods : { theme : 'shriming', size : 's', 'has-clear' : true } },
        { block : 'spin', mods : { theme : 'shriming', size : 's' } }
    ],
    shouldDeps : [
        { elems : ['title', 'container', 'item', 'spin', 'counter', 'add-channel-input'] },
        { elem : 'addition', mods : { 'open' : true } },
        { block : 'avatar' },
        { block : 'i-chat-api' },
        { block : 'list', elem : 'item', mods : { type : ['channels', 'users'] } },
        { block : 'user' },
        { block : 'notify' },
        { block : 'events', elems : 'channels' },
        { block : 'button' },
        { block : 'keyboard', elem : 'codes' }
    ]
});
