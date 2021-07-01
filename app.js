'use strict';
const fso = require('fs');
const EXT = require('./extracts');
global.master = fso.readFileSync('test/test-inheritence.vbs').toString();
let newClasses = EXT.extractVBSFileMethods();
fso.writeFileSync('./test/test-inheritence-remaining.vbs', global.master)
fso.writeFileSync('./test/test-inheritence-classes.json', JSON.stringify(newClasses, null, 2));

// TODO(s):
// Function return types can be objects (Set x = y); Need to capture this information in class.json object and will be added when writing extends class.
// Overriding a super class method in child class with keyword Override (or something similar)
// Test multi-level class inheritends. Ex: a extends b extends c
// Test multi-parent extension. Ex: a extends b,c
// Super class init() or similar methods (using Default keyword); Or call parent class name with Super.init() or something similar approach.
// Default should only available on property GET, not on LET/SET
// Move extract sub/function/proprety code into a module
// Resolve each class super methods in-memory before writing. Also, circlar reference error need to be assessed before writing to output.
// Ability to delete in-line comments even if they include complex double-quotes
// Overridden methods should not be copied.
// Any default sub/func/prop copied from super class will be treated 'non-default'