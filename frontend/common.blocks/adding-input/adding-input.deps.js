[{
    mustDeps : [
        { block : 'i-bem', elems : ['dom'] },
        { block : 'input', mods : { theme : 'shriming', size : 's', width : 'available', 'has-clear' : true } },
        { block : 'spin', mods : { theme : 'shriming', size : 's', visible : true } },
        { block : 'button' }
    ],
    shouldDeps : [
        { elems : ['spin', 'input', 'button'] },
        { block : 'keyboard', elem : 'codes' },
        { block : 'i-chat-api' }
    ]
},
{
    tech : 'spec.js',
    mustDeps : { tech : 'bemhtml', block : 'adding-input' }
}];
