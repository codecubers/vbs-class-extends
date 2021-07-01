const fs = require('fs');
const { removeEmptyLines, deCompress, flatToTree, appendMethod, addSuperPublicMethods, extendClass } = require('./functions');
const classes = require('./test/test-inheritence-classes.json');

let classNames = []
let extending = []
let classObjects = {}

classes.forEach(cls => {
    let { name, isExtends, extendsClass } = cls;
    if (classNames.includes(name)) {
        throw new Error(`Class ${name} is already declare. Cannot be added again.`)
    }
    classNames.push(name);
    classObjects[name] = cls;
    if (isExtends) {
        extending.push({
            child: name,
            parent: extendsClass,
            code: cls
        })
    }
});

var yallist = require('yallist')
let { nodes, leaves } = flatToTree(extending, 'child', 'parent', null, false);
var myList;
function getAnsestry(child) {
    myList.push(child)
    if (nodes.hasOwnProperty(child) && nodes[child].parent) {
        return getAnsestry(nodes[child].parent);
    } return child;
}
let classResolved = {}
Object.keys(leaves).forEach((leave) => {
    myList = yallist.create()
    getAnsestry(leave)
    myList.reverse()
    let arr = myList.toArray();
    for (let index = 1; index < arr.length; index++) {
        const parent = arr[index - 1];
        const child = arr[index];
        // console.log(`${child} -> ${parent}`)
        classResolved[child] = extendClass(classObjects[child], classObjects[parent])
    }
})
// console.log(classResolved)

let outStructure = fs.readFileSync('test/test-inheritence-remaining.vbs').toString();
classes.forEach(cls => {
    let { name, body } = cls;
    let newClassBody = (classResolved.hasOwnProperty(name))
        ? deCompress(classResolved[name])
        : deCompress(body);

    newClassBody = newClassBody.replace(/[\s]*EXTENDS[\s]*(.*)/i, '');
    newClassBody = removeEmptyLines(newClassBody)
    // console.log('replacing class : ', name)
    outStructure = outStructure.replace(`CLASS_${name}`, newClassBody);
});
// console.log(outStructure)
fs.writeFileSync(`test/test-inheritence-out.vbs`, '\' Build: test-inheritence.vbs\n\n' + outStructure)