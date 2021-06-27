'use strict';
var snappy = require('snappy')
var _lz = require('lz-string');
// // return it as a string

let REGEX_SUB_NAME = /SUB[ \t]+((\w+)(?:[ \t]*\((?:[^\(\)]*)\))*)(.*)END SUB/igms
let REGEX_FUNC_NAME = /FUNCTION[ \t]+((\w+)(?:[ \t]*\((?:[^\(\)]*)\))*)(.*)END FUNCTION/igms
let REGEX_PROP_NAME = /PROPERTY[ \t]+(GET|SET|LET)[ \t]+((\w+)(?:[ \t]*\((?:[^\(\)]*)\))*)(.*)END PROPERTY/igms

let REGEX_CLASS_NAME = /CLASS[ \t]+(\w+)(.*)END Class/igsm
let REGEX_CLASS_EXTEND = /CLASS[\s]+(\w+)[\s]+(?:extends[\s]+(\w+))(.*)END Class/igsm

/**
 * Regular Expression to extract SUB routine signature
 * Group 1: Full signature of the Sub Routine Ex: public default SUB abc(kjkl, kljklj, sdfds, jkljlk, sdfsdf)
 * Group 2: Simple name of the Sub Routine Ex: abc
 * Group 3: List of paramters; NULL if sub does not have paranthesis (); EMPTY string if sub have paranthesis but no values passed
 * Note: Public/Private, Default will be included only if present
 * Link: https://regex101.com/r/5x7jdW/1
 */
let REGEX_SUB = /((?:(?:PUBLIC|PRIVATE)[ \t]+)*(?:(?:DEFAULT)[ \t]+)*SUB[ \t]+(?:(\w+)(?:[ \t]*\(([^\(\)]*)\))*))(?:.*)END SUB/igms

/**
 * Regular Expression to extract Function routine signature
 * Group 1: Full signature of the Function Routine Ex: public default Function abc(kjkl, kljklj, sdfds, jkljlk, sdfsdf)
 * Group 2: Simple name of the Function Routine Ex: abc
 * Group 3: List of paramters; NULL if Function does not have paranthesis (); EMPTY string if function have paranthesis but no values passed
 * Note: Public/Private, Default will be included only if present
 * Link: https://regex101.com/r/qJRozP/1
 */
let REGEX_FUNCTION = /((?:(?:PUBLIC|PRIVATE)[ \t]+)*(?:(?:DEFAULT)[ \t]+)*FUNCTION[ \t]+(?:(\w+)(?:[ \t]*\(([^\(\)]*)\))*))(?:.*)END FUNCTION/igms

/**
 * Regular Expression to extract property routine signature
 * Group 1: Full signature of the Property Routine Ex: public default Property Get abc(kjkl, kljklj, sdfds, jkljlk, sdfsdf)
 * Group 2: Simple name of the Property Routine Ex: abc
 * Group 3: List of paramters; NULL if Property does not have paranthesis (); EMPTY string if Property have paranthesis but no values passed
 * Note: Public/Private, Default will be included only if present
 * Link: https://regex101.com/r/nDz3Jh/1
 */
let REGEX_PROPERTY = /((?:(?:PUBLIC|PRIVATE)[ \t]+)*(?:(?:DEFAULT)[ \t]+)*PROPERTY[ \t]+(?:GET|SET|LET)[ \t]+(?:(\w+)(?:[ \t]*\(([^\(\)]*)\))*))(?:.*)END PROPERTY/igms

let REGEX_COMMENTS_NEWLINE = /(^[ \t]*(?:'(?:.*))$)/gm
let REGEX_COMMENTS_INLINE_NO_QUOTES = /([ \t]*'(?:[^\n"])*$)/gm


const compress = (str) => _lz.compressToBase64(str);
const deCompress = (str) => _lz.decompressFromBase64(str);

function typeCheck(type) {
    type = type.trim().toUpperCase();
    return ['FUNCTION', 'SUB', 'PROPERTY'].includes(type) ? type : 'UNKNOWN';
}

function extract_methods(type, code, pub=false) {
    type = typeCheck(type);
    if (type === 'UNKNOWN') throw new Error("Invalid method type supplied. Must be one of SUB/FUNCTION/PROPERTY.")
    let rx = (pub ? '[ \t]*PUBLIC[ \t]+' : '[ \t]*(?:PRIVATE|PROTECTED)*[ \t]*');
    rx += `${type}[ \t]+(?:.*[\r\n])*?(.*)END ${type}[ \t]*`;
    return code.match(new RegExp(rx, 'igm'))
}

function extract_classes(code) {
    var re = new RegExp('[ \t]*CLASS[ \t]*(?:.*[\r\n])*?(.*)END CLASS[ \t]*', 'igm');
    return code.match(re)
}

function removeCommentsStart(code) {
    //^[ \t]*['].*
    //[.]*['].*$
    return code.replace(/[.]*['](.*)[^"]$/gm, '').replace(/[\r\n][\r\n][\r\n]+/gm, '\n')
}

function classExtends(code) {
    // var re = new RegExp('CLASS[\s]+(\w+)[\s]+(?:extends[\s]+(\w+))(.*)END Class', 'igsm')
    var re = /CLASS[\s]+(\w+)[\s]+(?:extends[\s]+(\w+))(.*)END Class/igsm
    var match = re.exec(code);
    // console.log('match', match)
    return match ? { base: match[1], _extends: match[2] } : null

}

function extract_className(code) {
    // console.log('searching class name in:' + code)
    var re = /CLASS[ \t]+(\w+)(.*)END Class/igsm
    var match = re.exec(code);
    return match[1]
}

function extract_procedureName(index, code, type) {
    type = typeCheck(type);
    if (type === 'UNKNOWN') throw new Error("Invalid type supplied. Must be one of SUB/FUNCTION/PROPERTY.");
    let i = (type === 'PROPERTY') ? 2 : 1;
    var re;
    if (type === 'SUB') re = /SUB[ \t]+(\w+)(.*)END SUB/igsm
    if (type === 'FUNCTION') re = /FUNCTION[ \t]+(\w+)(.*)END FUNCTION/igsm
    if (type === 'PROPERTY') re = /PROPERTY[ \t]+(GET|SET|LET)[ \t]+(\w+)(.*)END PROPERTY/igsm
    var match = re.exec(code);
    if (match) return (type === 'PROPERTY') ? match[i] + '.' + match[1] : match[i];
    return index;
}

// function extract_procedureSignature(index, code, type) {
//     type = typeCheck(type);
//     if (type === 'UNKNOWN') throw new Error("Invalid type supplied. Must be one of SUB/FUNCTION/PROPERTY.");
//     //TODO: Temp bi-pass
//     if (type === 'PROPERTY') return extract_procedureName(index, code, type)
//     var re;
//     if (type === 'SUB') re = REGEX_SUB
//     else if (type === 'FUNCTION') re = REGEX_FUNCTION
//     else if (type === 'PROPERTY') re = REGEX_PROPERTY
//     try {
//         var match = re.exec(code);
//     } catch (error) {
//         console.error(error)
//     }
//     let out = {
//         name: `${type}_${index}`
//     }
//     if (match) {
//         out.sign = match[1];
//         out.name = match[2];
//         if (match[3]) out.params = match[3]
//         return out;
//     } else {
//         return extract_procedureName(index, code, type)
//     }
// }
function extractProcedures(cls, type, _clsObj, _clsRemaining) {
    let _methods = {}
    let _public = extract_methods(type, cls, true);
    if (_public) {
        _public.forEach((sub, index) => {
            let _name = extract_procedureName(index, sub, type);
            _methods[_name] = {
                code: compress(sub),
                index: index,
                isPublic: true
            }
            _clsRemaining = _clsRemaining.replace(sub, 'PUBLIC_' + type + '_' + _name)
        })
    }
    let _private = extract_methods(type, cls, false);
    if (_private) {
        _private.forEach((sub, index) => {
            let _name = extract_procedureName(index, sub, type);
            if (!_methods.hasOwnProperty(_name)) {
                _methods[_name] = {
                    code: compress(sub),
                    index: index,
                    isPublic: false
                }
                _clsRemaining = _clsRemaining.replace(sub, 'PRIVATE_' + type + '_' + _name)
            }
        })
    }
    if (_methods) _clsObj[type.toLowerCase()] = _methods;
    return _clsRemaining;
}

function extractVBSFileMethods(vbsBody) {
    let newClasses = [];
    vbsBody = removeCommentsStart(vbsBody)
    let classes = extract_classes(vbsBody)
    classes.forEach((cls) => {
        let clsName = extract_className(cls);
        // console.log("class:", clsName);
        vbsBody = vbsBody.replace(cls, `CLASS_${clsName}`)
        // compress(cls).then(compressedBody => {
            // console.log("compressedBody:", compressedBody);
            let _class = {
                name: clsName,
                body: compress(cls)
            }
    
            let ext = classExtends(cls);
            if (ext) {
                let { base, _extends } = ext;
                _class.extends = _extends
            }
            let _structure = cls;
            _structure = extractProcedures(cls, 'PROPERTY', _class, _structure)
            _structure = extractProcedures(cls, 'SUB', _class, _structure)
            _structure = extractProcedures(cls, 'FUNCTION', _class, _structure)
            _class.structure = _structure
            newClasses.push(_class)
        // })
    });
    return newClasses;
}

function main() {
    const fso = require('fs');
    let vbsBody = fso.readFileSync('C:\\Users\\nanda\\git\\xps.local.npm\\vbs-excel-unpack\\build\\export-bundle.vbs').toString();
    let newClasses = extractVBSFileMethods(vbsBody);
    fso.writeFileSync('./remaining.vbs', vbsBody)
    fso.writeFileSync('./classes-overall.json', JSON.stringify(newClasses, null, 2));
}

main();