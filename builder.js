const fs = require('fs');
const classes = require('./test/test-inheritence-classes.json');

const appendMethod = (cls, m) => cls.replace('End Class', `\n\n\t${m}\nEnd Class`)

const addSuperPublicMethods = ( structure, arrMethods, type, superClsName ) => {
    if (!arrMethods) return structure;
    Object.values(arrMethods).forEach((method) => {
        let {name, sign, isPublic, end} = method
        let superCall = sign.substring(sign.indexOf(name))
        if (isPublic) {
            let _sign = `Public ${type} ${sign.substring(sign.indexOf(name))}`;
            let callSuper = `${name} = m_${superClsName}.${superCall}`
            if (type.includes(' Let ')) {
                callSuper = `m_${superClsName}.${name} = ${callSuper.replace(name, '')}`
            } else if (type.includes(' Set ')) {
                callSuper = `set m_${superClsName}.${name} = ${callSuper.replace(name, '')}`
            } else if (type === 'Sub') {
                callSuper = `call m_${superClsName}.${superCall}`
            }
            let method = `${_sign} : ${callSuper} : ${end}`;
            structure = appendMethod(structure, method)
        }
    })
    return structure;
}

let classNames = []
let extendables = {}
fs.writeFileSync(`test/test-inheritence-out.vbs`, '\'   Class extraction started.')

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

classes.forEach(cls => {
    let {name, isExtends, extendsClass, subs, functions, propertys, noMethods } = cls;
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
        fs.appendFileSync(`test/test-inheritence-out.vbs`, noMethods)
    }
});