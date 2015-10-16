({
    mustDeps : [
        { block : 'libs' },
        { block : 'variables' },
        { block : 'i-bem', elem : 'dom' }
    ],
    shouldDeps : [
        { elems : ['main', 'sidebar'] },
        { block : 'landing' },
        { block : 'controller' },
        { block : 'clearfix' },
        { block : 'header', mods : { 'logged': true } },
        { block : 'main', mods : { 'logged': true } },
        { block : 'video' },
        { block : 'list', elems: ['addition'] },
        { block : 'dialog' },
        { block : 'link' },
        { block : 'dialog', elems : ['header', 'history', 'console'] }
    ]
});
