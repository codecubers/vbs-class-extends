'use strict';
const fso = require('fs');
const EXT = require('./extracts');

function main() {
    let vbsBody = fso.readFileSync('test/test-inheritence.vbs').toString();
    let newClasses = EXT.extractVBSFileMethods(vbsBody);
    fso.writeFileSync('./test/test-inheritence-remaining.vbs', vbsBody)
    fso.writeFileSync('./test/test-inheritence-classes.json', JSON.stringify(newClasses, null, 2));
}

main();

// TODO(s):
// Function return types can be objects (Set x = y); Need to capture this information in class.json object and will be added when writing extends class.
// Overriding a super class method in child class with keyword Override (or something similar)
// Test multi-level class inheritends. Ex: a extends b extends c
// Test multi-parent extension. Ex: a extends b,c
// Super class init() or similar methods (using Default keyword); Or call parent class name with Super.init() or something similar approach.