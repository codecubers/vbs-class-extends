const fs = require('fs');
const { removeEmptyLines, deCompress, flatToTree, appendMethod, addSuperPublicMethods } = require('./functions');
const classes = require('./test/test-inheritence-classes.json');
let outStructure = fs.readFileSync('test/test-inheritence-remaining.vbs').toString();

let classNames = []
let arrextendables = []
let extendables = {}
let extending = []
let classObjects = {}
fs.writeFileSync(`test/test-inheritence-out.vbs`, '\' Build: test-inheritence.vbs\n')

classes.forEach(cls => {
    let { name, isExtendable, isExtends, extendsClass } = cls;
    if (classNames.includes(name)) {
        throw new Error(`Class ${name} is already declare. Cannot be added again.`)
    } 
    classNames.push(name);
    classObjects[name] = cls;
    if (isExtendable) {
        extendables[name] = cls;
        arrextendables.push(name);
    }
    if (isExtends) {
        extending.push({
            child: name,
            parent: extendsClass,
            code: cls
        })
    }
});
// console.log('classNames')
// console.log(classNames)
// console.log('arrextendables')
// console.log(arrextendables)
console.log('extending')
console.log(extending)
let tree = flatToTree(extending, 'child', 'parent', null, false)
console.log(tree)
let lineage = tree.nodes;
var yallist = require('yallist')
var myList;
let _ansestry;
function getAnsestry(child) {
    _ansestry += child;
    myList.push(child)
    if (lineage.hasOwnProperty(child) && lineage[child].parent) {
        _ansestry += ' > '
        return getAnsestry(lineage[child].parent);
    } return child;
}
let classResolved = {}
let { leaves } = tree;
Object.keys(leaves).forEach((leave) => {
    // console.log('leave: ' + leave)
    _ansestry = '';
    myList = yallist.create()
    let _finalParent = getAnsestry(leave)
    console.log(_ansestry)
    console.log(myList.toArray())
    myList.reverse()
    console.log(myList.toArray())
    let arr = myList.toArray();
    for (let index = 1; index < arr.length; index++) {
        const parent = arr[index - 1];
        const child = arr[index];
        console.log(`${child} -> ${parent}`)
        classResolved[child] = extendClass(classObjects[child], classObjects[parent])
    }
    // myList.forEachReverse(function (k, index, list) {
    //     if (index > 0) {
    //         console.log(list)
    //         let a = list.get[index - 1]
    //         let b = list.get[index]
    //         console.log(`${a} -> ${b}`)
    //     }
    // })
})
console.log(classResolved)

function extendClass(child, parent) {
    let {name, extendsClass, subs, functions, propertys, noMethods } = child;

    let constructor;
    if (subs && subs.CLASS_INITIALIZE) constructor = subs.CLASS_INITIALIZE;
    if (!constructor) {
        constructor = {
                sign: "Private Sub Class_Initialize",
                end: "End Sub",
                body: ""
            }
    }
    let {sign, end, body} = constructor;
    let method = `\n\n    Private m_${extendsClass}\n\n`
    method += `    ${sign}\n        set m_${extendsClass} = new ${extendsClass}`;
    if (body) method += `\n\t\t${body}`
    method += `\n    ${end}\n\n`
    noMethods = appendMethod(noMethods, method)

    noMethods = addSuperPublicMethods(noMethods, parent.subs, "Sub", extendsClass)
    noMethods = addSuperPublicMethods(noMethods, parent.functions, "Function", extendsClass)
    noMethods = addSuperPublicMethods(noMethods, parent.propertys, "Property", extendsClass)

    if (propertys) Object.values(propertys).forEach(method => noMethods = appendMethod(noMethods, method.code))
    if (functions) Object.values(functions).forEach(method => noMethods = appendMethod(noMethods, method.code))
    if (subs) {       
        Object.entries(subs).forEach(([subNameUpper, sub]) => {
            if (subNameUpper === 'CLASS_INITIALIZE') {
                noMethods = appendMethod(noMethods, '')
            } else {
                noMethods = appendMethod(noMethods, sub.code)
            }
        })
    }
    return noMethods;
}

classes.forEach(cls => {
    let {name, body, isExtends, extendsClass, subs, functions, propertys, noMethods } = cls;
    let newClassBody;
    // if (isExtends) {
    //     if (!classNames.includes(extendsClass)) {
    //         throw new Error(`Class ${name} extends ${extendsClass} but ${extendsClass} is not declared.`)
    //     }
    //     if (!extendables.hasOwnProperty(extendsClass)) {
    //         throw new Error(`Class ${name} extends ${extendsClass} but ${extendsClass} is not extendable.`)
    //     }

    //     let constructor;
    //     if (subs && subs.CLASS_INITIALIZE) constructor = subs.CLASS_INITIALIZE;
    //     if (!constructor) {
    //         constructor = {
    //                 sign: "Private Sub Class_Initialize",
    //                 end: "End Sub",
    //                 body: ""
    //             }
    //     }
    //     let {sign, end, body} = constructor;
    //     let method = `\n\n    Private m_${extendsClass}\n\n`
    //     method += `    ${sign}\n        set m_${extendsClass} = new ${extendsClass}`;
    //     if (body) method += `\n\t\t${body}`
    //     method += `\n    ${end}\n\n`
    //     noMethods = appendMethod(noMethods, method)

    //     let superClass = extendables[extendsClass];
    //     noMethods = addSuperPublicMethods(noMethods, superClass.subs, "Sub", extendsClass)
    //     noMethods = addSuperPublicMethods(noMethods, superClass.functions, "Function", extendsClass)
    //     noMethods = addSuperPublicMethods(noMethods, superClass.propertys, "Property", extendsClass)

    //     if (propertys) Object.values(propertys).forEach(method => noMethods = appendMethod(noMethods, method.code))
    //     if (functions) Object.values(functions).forEach(method => noMethods = appendMethod(noMethods, method.code))
    //     if (subs) {       
    //         Object.entries(subs).forEach(([subNameUpper, sub]) => {
    //             if (subNameUpper === 'CLASS_INITIALIZE') {
    //                 noMethods = appendMethod(noMethods, '')
    //             } else {
    //                 noMethods = appendMethod(noMethods, sub.code)
    //             }
    //         })
    //     }
    //     newClassBody = noMethods;
    // } else {
        console.log(name)
        if (classResolved.hasOwnProperty(name)) {
            // console.log(classResolved[name])
            newClassBody = deCompress(classResolved[name]);
        } else {
            newClassBody = deCompress(body);
        }
        // console.log(newClassBody)
    // }
    
    newClassBody = newClassBody.replace(/[\s]*EXTENDABLE[\s]*/i, '');
    newClassBody = newClassBody.replace(/[\s]*EXTENDS[\s]*(.*)/i, '');
    newClassBody = removeEmptyLines(newClassBody)
    outStructure = outStructure.replace(`CLASS_${name}`, newClassBody);
});

fs.writeFileSync(`test/test-inheritence-out.vbs`, outStructure)