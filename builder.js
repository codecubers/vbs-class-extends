const fs = require('fs');
const { removeEmptyLines, deCompress, resolveExtendingClasses } = require('./functions');
const classes = require('./test/test-inheritence-classes.json');
let outStructure = fs.readFileSync('test/test-inheritence-remaining.vbs').toString();

let duplicateClassCheck = false;
let duplicateClasses = [];
let classNames = [];
let extending = [];
let classObjects = classes.reduce((obj, cls) => {
    let { name, isExtends, extendsClass } = cls;
    if (classNames.includes(name)) {
        duplicateClassCheck = true;
        duplicateClasses[name] = true;
    }
    classNames.push(name);
    if (isExtends) {
        extending.push({
            child: name,
            parent: extendsClass,
            code: cls
        })
    }
    obj[name] = cls;
    return obj;
}, {});
if (duplicateClassCheck) {
    throw new Error(`Class(es) [${Object.keys(duplicateClasses).join(',')}] have duplicate declarations. Please fix and try again.`)
}

let classResolved = resolveExtendingClasses(extending, classObjects)
classes.forEach(cls => {
    let { name, body } = cls;
    let newClassBody = (classResolved.hasOwnProperty(name))
        ? deCompress(classResolved[name])
        : deCompress(body);
    newClassBody = newClassBody.replace(/[\s]*EXTENDS[\s]*(.*)/i, '');
    newClassBody = removeEmptyLines(newClassBody)
    outStructure = outStructure.replace(`CLASS_${name}`, newClassBody);
});
fs.writeFileSync(`test/test-inheritence-out.vbs`, '\' Build: test-inheritence.vbs\n\n' + outStructure)