const extractVBSFileMethods = require('./extract');
const resolveVBSClasses = require('./resolve');

const extendVbsClasses = function(source) {
    return new Promise((resolve, reject) => {
        extractVBSFileMethods(source).then((extracts)=>{
            let { classes, skeleton } = extracts;    
            resolveVBSClasses(classes, skeleton).then((resolved)=>{
                console.log('Extended classes resolved successfully.')
                resolve(resolved)
            }).catch((error)=>{
                reject(error)
            })
        })
    })
}

module.exports = extendVbsClasses