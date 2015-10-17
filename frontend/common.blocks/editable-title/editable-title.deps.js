[{
    mustDeps : [
        { block : 'i-bem', elems : ['dom'] },
        { block : 'input', mods : { theme : 'shriming', size : 's', width : 'available' } },
        { block : 'spin', mods : { theme : 'shriming', size : 's', visible : true } }
    ],
    shouldDeps : [
        { elems : ['spin', 'input', 'title'] },
        { block : 'keyboard', elem : 'codes' },
        { block : 'i-chat-api' },
        { block : 'notify' }
    ]
},
{
    tech : 'spec.js',
    mustDeps : { tech : 'bemhtml', block : 'editable-title', mods : { active : true } }
}];
