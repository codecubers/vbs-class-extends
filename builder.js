const fs = require('fs');
const classes = require('./classes-overall.json');

var _lz = require('lz-string');
const _compress = (str) => _lz.compressToBase64(str);
const _deCompress = (str) => _lz.decompressFromBase64(str);
const appendMethod = (cls, m) => cls.replace('End Class', `\n\n\t${m}\nEnd Class`)
const insertMethod = (cls, sign, m) => cls.replace(`PUBLIC_${sign}`, m)
                                            .replace(`PRIVATE_${sign}`, m)
                                                .replace(`${sign}`, m)
const addSuperPublicMethods = ( structure, arrMethods, type, superClsName ) => {
    if (!arrMethods) return structure;
    Object.values(arrMethods).forEach((method) => {
        let {name, sign, isPublic, end} = method
        let superCall = sign.substring(sign.indexOf(name))
        if (isPublic) {
            let _sign = `Public ${type} ${sign.substring(sign.indexOf(name))}`;
            let method = `${_sign} : ${name} = m_${superClsName}.${superCall} : ${end}`;
            structure = appendMethod(structure, method)
        }
    })
    return structure;
}

// console.log(classes)
let classNames = []
let extendables = {}

classes.forEach(cls => {
    let { name, isExtendable } = cls;
    if (classNames.includes(name)) {
        throw new Error(`Class ${name} is already declare. Cannot be added again.`)
    } 
    classNames.push(name);
    if (isExtendable) {
        extendables[name] = cls;
    }
});
/*
classes.forEach(cls => {
    let {name, isExtendable, isExtends, extendsClass, subs, functions, propertys, structure, noMethods } = cls;
    if (isExtends) {
        if (!classNames.includes(extendsClass)) {
            throw new Error(`Class ${name} extends ${extendsClass} but ${extendsClass} is not declared.`)
        }
        if (!extendables.hasOwnProperty(extendsClass)) {
            throw new Error(`Class ${name} extends ${extendsClass} but ${extendsClass} is not extendable.`)
        }

        let constructor;
        if (subs) {       
            Object.entries(subs).forEach(([subNameUpper, sub]) => {
                if (subNameUpper === 'CLASS_INITIALIZE') {
                    constructor = sub;
                    structure = insertMethod(structure, `SUB_${subNameUpper}`, '')
                } else {
                    structure = insertMethod(structure, `SUB_${subNameUpper}`, sub.code)
                }
            })
        }

        if (functions) {
            Object.entries(functions).forEach(([funcNameUpper, func]) => {
                structure = insertMethod(structure, `FUNCTION_${funcNameUpper}`, func.code)
            })
        }

        if(propertys) {
            Object.entries(propertys).forEach(([propNameUpper, prop]) => {
                structure = insertMethod(structure, `PROPERTY_${propNameUpper}`, prop.code)
            })
        }

        let superClass = extendables[extendsClass];
        structure = addSuperPublicMethods(structure, superClass.subs, "Sub", extendsClass)
        structure = addSuperPublicMethods(structure, superClass.functions, "Function", extendsClass)
        structure = addSuperPublicMethods(structure, superClass.propertys, "Property", extendsClass)

        if (!constructor) {
            constructor = {
                    sign: "Private Sub Class_Initialize",
                    end: "End Sub",
                    body: ""
                }
        }

        let {sign, end, body} = constructor;
        let method = `${sign}\n\t\tset m_${extendsClass} = new ${extendsClass}`;
        if (body) {
            method += `\n\t\t${body}`
        }
        method += `\n\t${end}\n\n`
        structure = appendMethod(structure, method)
        noMethods = appendMethod(noMethods, method)

        structure = structure.replace(/[\s]*EXTENDS[\s*](.*)/i, '');
        fs.writeFileSync(`${name}_replace.vbs`, structure);
    }
});
*/

classes.forEach(cls => {
    let {name, isExtendable, isExtends, extendsClass, subs, functions, propertys, structure, noMethods } = cls;
    if (isExtends) {
        if (!classNames.includes(extendsClass)) {
            throw new Error(`Class ${name} extends ${extendsClass} but ${extendsClass} is not declared.`)
        }
        if (!extendables.hasOwnProperty(extendsClass)) {
            throw new Error(`Class ${name} extends ${extendsClass} but ${extendsClass} is not extendable.`)
        }

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
        let method = `\n\nPrivate m_${extendsClass}\n\n`
        method += `${sign}\n\t\tset m_${extendsClass} = new ${extendsClass}`;
        if (body) method += `\n\t\t${body}`
        method += `\n\t${end}\n\n`
        noMethods = appendMethod(noMethods, method)

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

        let superClass = extendables[extendsClass];
        noMethods = addSuperPublicMethods(noMethods, superClass.subs, "Sub", extendsClass)
        noMethods = addSuperPublicMethods(noMethods, superClass.functions, "Function", extendsClass)
        noMethods = addSuperPublicMethods(noMethods, superClass.propertys, "Property", extendsClass)


        noMethods = noMethods.replace(/[\s]*EXTENDS[\s*](.*)/i, '');
        fs.writeFileSync(`test/${name}_reconstruct.vbs`, noMethods);
    }
});