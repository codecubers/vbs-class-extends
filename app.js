'use strict';
const fs = require('fs');
const extendeVBSClasses = require('./builder');
const EXT = require('./extracts');

let inVbs = 'test/test-inheritence.vbs';
let clsVbs = inVbs.replace('.vbs', '-classes.json');
let midVbs = inVbs.replace('.vbs', '-remaining.vbs');
let outVbs = inVbs.replace('.vbs', '-out.vbs');

// Extract the classes
global.master = fs.readFileSync(inVbs).toString();
let newClasses = EXT.extractVBSFileMethods();
// fs.writeFileSync(midVbs, global.master)
// fs.writeFileSync(clsVbs, JSON.stringify(newClasses, null, 2));

// Resolve and re-write the source vbs
// const classes = require(clsVbs);
// let outStructure = fs.readFileSync(midVbs).toString();
extendeVBSClasses(newClasses, global.master).then((resolved)=>{
    console.log('Classes resolved successfully.')
    fs.writeFileSync(outVbs, '\' Build: test-inheritence.vbs\n\n' + resolved)
}).catch((error)=>{
    console.error(error)
})

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