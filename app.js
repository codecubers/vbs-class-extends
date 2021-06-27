'use strict';
var snappy = require('snappy')
var _lz = require('lz-string');
// // return it as a string
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