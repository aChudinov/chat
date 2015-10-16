({
    mustDeps : [
        { block : 'libs' },
        { block : 'variables' },
        { block : 'i-bem', elem : 'dom' }
    ],
    shouldDeps : [
        { elems : 'sidebar', mods : ['left', 'right'] },
        { elems : 'main' },
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
