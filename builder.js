const fs = require('fs');
const classes = require('./classes-overall.json');

var _lz = require('lz-string');
const _compress = (str) => _lz.compressToBase64(str);
const _deCompress = (str) => _lz.decompressFromBase64(str);

// console.log(classes)
let classNames = []
let extendables = {}
classes.forEach(cls => {
    let {name, isExtendable, isExtends, extendsClass, subs, functions, propertys, structure } = cls;
    if (classNames.includes(name)) {
        throw new Error(`Class ${name} is already declare. Cannot be added again.`)
    } 
    classNames.push(name);
    if (isExtendable) {
        extendables[name] = cls;
    }
});

classes.forEach(cls => {
    let {name, isExtendable, isExtends, extendsClass, subs, functions, propertys, structure } = cls;
    if (isExtends) {
        if (!classNames.includes(extendsClass)) {
            throw new Error(`Class ${name} extends ${extendsClass} but ${extendsClass} is not declared.`)
        }
        if (!extendables.hasOwnProperty(extendsClass)) {
            throw new Error(`Class ${name} extends ${extendsClass} but ${extendsClass} is not extendable.`)
        }
        let _extenable = extendsClass[extendsClass];

        // if (subs.hasOwnProperty('CLASS_INITIALIZE')) {

        // }
        if (subs) {       
            Object.entries(subs).forEach(([subNameUpper, sub]) => {
                let subName = sub.name;
                let isSubPublic = sub.isPublic;
                let subCode = sub.code; // _deCompress(sub.code);
                console.log(subCode)
                structure = structure.replace(`PUBLIC_SUB_${subNameUpper}`, subCode)
                structure = structure.replace(`PRIVATE_SUB_${subNameUpper}`, subCode)
                structure = structure.replace(`SUB_${subNameUpper}`, subCode)
                if (isSubPublic) {
                    structure = structure.replace('End Class', `\r\n\r\n\tPublic Sub ${subName} : ${subName} = m_${extendsClass}.${subName} : End Sub \r\n\r\nEnd Class`)
                }
            })
        }
        if (functions) {
            Object.entries(functions).forEach(([funcNameUpper, func]) => {
                let funcName = func.name;
                let isFuncPublic = func.isPublic;
                let funcCode = func.code; //_deCompress(func.code);
                structure = structure.replace(`PUBLIC_FUNCTION_${funcNameUpper}`, funcCode)
                structure = structure.replace(`PRIVATE_FUNCTION_${funcNameUpper}`, funcCode)
                structure = structure.replace(`FUNCTION_${funcNameUpper}`, funcCode)
                if (isFuncPublic) {
                    structure = structure.replace('End Class', `\r\n\r\n\tPublic Function ${funcName} : ${funcName} = m_${extendsClass}.${funcName} : End Function \r\n\r\nEnd Class`)
                }
            })
        }
        if(propertys) {
            Object.entries(propertys).forEach(([propNameUpper, prop]) => {
                let propName = prop.name;
                let isPropPublic = prop.isPublic;
                let propCode = prop.code; //_deCompress(prop.code);
                structure = structure.replace(`PUBLIC_PROPERTY_${propNameUpper}`, propCode)
                structure = structure.replace(`PRIVATE_PROPERTY_${propNameUpper}`, propCode)
                structure = structure.replace(`PROPERTY_${propNameUpper}`, propCode)
                if (isPropPublic) {
                    structure = structure.replace('End Class', `\r\n\r\n\tPublic Property ${propName} : ${propName} = m_${extendsClass}.${propName} : End Property \r\n\r\nEnd Class`)
                }
            })
        }
        structure = structure.replace(/[\s]*EXTENDS[\s*](.*)/i, '');
        fs.writeFileSync(`${name}.vbs`, structure);
    }
});