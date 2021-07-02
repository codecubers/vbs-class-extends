const fs = require('fs');
const { removeEmptyLines, deCompress, resolveExtendingClasses } = require('./functions');
async function extendeVBSClasses(jsonClasses, vbsSkeleton) {
    return new Promise((resolve, reject) => {
        let duplicateClassCheck = false;
        let duplicateClasses = [];
        let classNames = [];
        let extending = [];

        let classObjects = jsonClasses.reduce((obj, cls) => {
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
            // throw new Error(`Class(es) [${Object.keys(duplicateClasses).join(',')}] have duplicate declarations. Please fix and try again.`)
            return reject(`Class(es) [${Object.keys(duplicateClasses).join(',')}] have duplicate declarations. Please fix and try again.`)
        }

        if (extending.length == 0) {
            console.log('No extended classes found to be resolved.')
            resolve(vbsSkeleton)
        } else {
            resolveExtendingClasses(extending, classObjects).then((classResolved)=>{      
                jsonClasses.forEach(cls => {
                    let { name, body } = cls;
                    let newClassBody = (classResolved.hasOwnProperty(name))
                        ? deCompress(classResolved[name])
                        : deCompress(body);
                    newClassBody = newClassBody.replace(/[\s]*EXTENDS[\s]*(.*)/i, '');
                    newClassBody = removeEmptyLines(newClassBody)
                    vbsSkeleton = vbsSkeleton.replace(`CLASS_${name}`, newClassBody);
                }); 
                resolve(vbsSkeleton)
            })           
        }
        
    })
}

module.exports = extendeVBSClasses