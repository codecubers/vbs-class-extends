'use strict';
var snappy = require('snappy')
var _lz = require('lz-string');
const fso = require('fs');
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
let REGEX_SUB = /((?:(?:PUBLIC|PRIVATE)[ \t]+)*(?:(?:DEFAULT)[ \t]+)*SUB[ \t]+(?:(\w+)(?:[ \t]*\((?:[^\(\)]*)\))*))(?:.*)(END SUB)/igms

/**
 * Regular Expression to extract Function routine signature
 * Group 1: Full signature of the Function Routine Ex: public default Function abc(kjkl, kljklj, sdfds, jkljlk, sdfsdf)
 * Group 2: Simple name of the Function Routine Ex: abc
 * Group 3: List of paramters; NULL if Function does not have paranthesis (); EMPTY string if function have paranthesis but no values passed
 * Note: Public/Private, Default will be included only if present
 * Link: https://regex101.com/r/qJRozP/1
 */
let REGEX_FUNCTION = /((?:(?:PUBLIC|PRIVATE)[\s]+)*(?:(?:DEFAULT)[\s]+)*FUNCTION[\s]+(?:(\w+)(?:[\s]*\((?:[^\(\)]*)\))*))(?:.*)(END FUNCTION)/gims

/**
 * Regular Expression to extract property routine signature
 * Group 1: Full signature of the Property Routine Ex: public default Property Get abc(kjkl, kljklj, sdfds, jkljlk, sdfsdf)
 * Group 2: Simple name of the Property Routine Ex: abc
 * Group 3: List of paramters; NULL if Property does not have paranthesis (); EMPTY string if Property have paranthesis but no values passed
 * Note: Public/Private, Default will be included only if present
 * Link: https://regex101.com/r/nDz3Jh/1
 */
let REGEX_PROPERTY = /((?:(?:PUBLIC|PRIVATE)[ \t]+)*(?:(?:DEFAULT)[ \t]+)*PROPERTY[ \t]+(?:GET|SET|LET)[ \t]+(?:(\w+)(?:[ \t]*\((?:[^\(\)]*)\))*))(?:.*)(END PROPERTY)/igms

let REGEX_COMMENTS_NEWLINE = /(^[ \t]*(?:'(?:.*))$)/gm
let REGEX_COMMENTS_INLINE_NO_QUOTES = /([ \t]*'(?:[^\n"])*$)/gm
let REGEX_EMPTY_LINE_TWO_OR_MORE = /([ \t]*[\r\n]){3,}/gm


const compress = (str) => str; //_lz.compressToBase64(str);
const deCompress = (str) => _lz.decompressFromBase64(str);
const extractBody = (code, sign, end) => code.substring((code.indexOf(sign) + sign.length), code.indexOf(end));

function typeCheck(type) {
    type = type.trim().toUpperCase();
    return ['FUNCTION', 'SUB', 'PROPERTY'].includes(type) ? type : 'UNKNOWN';
}

function extract_methods(type, code, pub=false) {
    type = typeCheck(type);
    if (type === 'UNKNOWN') throw new Error("Invalid method type supplied. Must be one of SUB/FUNCTION/PROPERTY.")
    
    let rx = (pub ? `[ \t]*PUBLIC[ \t]*` : `[ \t]*(?:PRIVATE)*[ \t]*`);
    rx += `${type}[ \t]+(?:.*[\r\n])*?(.*)END ${type}[ \t]*`;
    // console.log("rx:", rx)
    return code.match(new RegExp(rx, 'igmu'))
}

function extract_subs(code, pub = false) {
    let rx = (pub ? '[ \t]*PUBLIC[ \t]*' : '[ \t]*(?:PRIVATE)*[ \t]*') + 'SUB[ \t]+(?:.*[\r\n])*?(.*)END SUB[ \t]*'
    var re = new RegExp(rx, 'igm');
    return code.match(re)
}
function extract_props(code, pub = false) {
    let rx = (pub ? '[ \t]*PUBLIC[ \t]*' : '[ \t]*(?:PRIVATE)*[ \t]*') + 'PROPERTY[ \t]+(?:GET|LET|SET)(?:.*[\r\n])*?(.*)END PROPERTY[ \t]*'
    var re = new RegExp(rx, 'igm');
    return code.match(re)
}

function extract_classes(code) {
    // var re = new RegExp('([\\s]*EXTENDABLE)*[\\s]*CLASS[\\s]*(?:.*[\\r\\n])*?(.*)END CLASS[\\s]*', 'igm');
    var re = /((?:[\s]*EXTENDABLE)*[\s]*CLASS[\s]*(?:.*[\r\n])*?(?:.*)END CLASS[\s]*)/igm
    return code.match(re)
}

const removeCommentsStart = (code) => code.replace(REGEX_COMMENTS_INLINE_NO_QUOTES, '');
const removeEmptyLines = (code) => code.replace(REGEX_EMPTY_LINE_TWO_OR_MORE, '\n\n');

function classExtends(code) {
    // var re = new RegExp('CLASS[\s]+(\w+)[\s]+(?:extends[\s]+(\w+))(.*)END Class', 'igsm')
    var re = /CLASS[\s]+(\w+)[\s]+(?:extends[\s]+(\w+))(.*)END Class/igsm
    var match = re.exec(code);
    // console.log('match', match)
    return match ? { base: match[1], _extends: match[2] } : null

}

function isClassExtendable(code) {
    // var re = new RegExp('CLASS[\s]+(\w+)[\s]+(?:extends[\s]+(\w+))(.*)END Class', 'igsm')
    var re = /EXTENDABLE[\s]+CLASS[\s]+(\w+)[\s]+(?:.*)END Class/igsm
    var match = re.exec(code);
    return match ? true: false

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
    return `${type}_${index}`;
}

function extract_procedureSignature(index, code, type) {
    type = typeCheck(type);
    if (type === 'UNKNOWN') throw new Error("Invalid type supplied. Must be one of SUB/FUNCTION/PROPERTY.");
    var re;
    if (type === 'SUB') re = REGEX_SUB
    else if (type === 'FUNCTION') re = REGEX_FUNCTION
    else if (type === 'PROPERTY') re = REGEX_PROPERTY
    let m;
    //TODO: without this while, the match is not working for all combinations.
    //But try to merge both into one.
    while ((m = re.exec(code)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === re.lastIndex) {
            re.lastIndex++;
        }
        //console.log(m)
        // The result can be accessed through the `m`-variable.
        // console.log("re:", re)
        // console.log('index:' + index + ' code:', code);
        m.forEach((match, groupIndex) => {
            // console.log(`Found match, group ${groupIndex}: ${match}`);
        });
    }
    var match = re.exec(code);
    let out = {
        name: `${type}_${index}`
    }
    if (match) {
        out.sign = match[1];
        out.name = match[2];
        out.end = match[3]
    } else {
        console.log("ERROR while exracting signature")
        console.log("re: ", re)
        console.log("code:", code)
    }
    return out;
}
function extractProcedures(cls, type, _clsObj, _clsRemaining) {
    let index = 1;
    let _methods = {}
    let _public;
    // if (type === 'SUB') {
    //     _public = extract_subs(cls, true);
    // } else {
        _public = extract_methods(type, cls, true);
    // }
    if (_public) {
        _public.forEach((sub) => {
            let {name, sign, end} = extract_procedureSignature(index, sub, type);
            // console.log('pub-name:', name)
            let _upper = name.toUpperCase();
            _methods[_upper] = {
                name: name,
                sign: sign,
                code: compress(sub),
                end: end,
                body: extractBody(sub, sign, end),
                index: index,
                isPublic: true
            }
            index++;
            _clsRemaining = _clsRemaining.replace(sub, 'PUBLIC_' + type + '_' + _upper)
        })
    }
    let _private;
    // if (type === 'SUB') {
    //     _private = extract_subs(cls, false);
    // } else {
        _private = extract_methods(type, cls, false);
    // }
    // console.log("sub", _private)
    if (_private) {
        _private.forEach((sub) => {
            let {name, sign, end} = extract_procedureSignature(index, sub, type);
            // console.log('pvt-name:', name)
            let _upper = name.toUpperCase();
            if (!_methods.hasOwnProperty(_upper)) {
                _methods[_upper] = {
                    name: name,
                    sign: sign,
                    code: compress(sub),
                    end: end,
                    body: extractBody(sub, sign, end),
                    index: index,
                    isPublic: false
                }
                index++;
                _clsRemaining = _clsRemaining.replace(sub, 'PRIVATE_' + type + '_' + _upper)
            }
        })
    }
    if (Object.keys(_methods).length > 0) _clsObj[type.toLowerCase() + 's'] = _methods;
    return _clsRemaining;
}

function extractVBSFileMethods(vbsBody) {
    let newClasses = [];
    vbsBody = removeCommentsStart(vbsBody)
    vbsBody = removeEmptyLines(vbsBody)
    fso.writeFileSync( `export-bundle-pretty.vbs`, vbsBody);
    let classes = extract_classes(vbsBody)
    classes.forEach((cls) => {
        let clsName = extract_className(cls);
        // fso.writeFileSync( `${clsName}.vbs`, cls);
        // console.log("class:", clsName);
        vbsBody = vbsBody.replace(cls, `CLASS_${clsName}`)
        let _class = {
            name: clsName,
            body: compress(cls)
        }

        if (isClassExtendable(cls)) {
            _class.isExtendable = true
        }

        let ext = classExtends(cls);
        if (ext) {
            let { base, _extends } = ext;
            _class.isExtends = true;
            _class.extendsClass = _extends
        }
        let _structure = cls;
        _structure = extractProcedures(cls, 'PROPERTY', _class, _structure)
        _structure = extractProcedures(cls, 'SUB', _class, _structure)
        _structure = extractProcedures(cls, 'FUNCTION', _class, _structure)
        _class.structure = _structure
        newClasses.push(_class)

    });
    return newClasses;
}

function main() {
    let vbsBody = fso.readFileSync('export-bundle.vbs').toString();
    // let vbsBody = fso.readFileSync('test.vbs').toString();
    // vbsBody = vbsBody.replace(/'/g, "\\'");
    // vbsBody = vbsBody.replace(/"/g, '\\"');
    // console.log("body", vbsBody)
    let newClasses = extractVBSFileMethods(vbsBody);
    fso.writeFileSync('./remaining.vbs', vbsBody)
    fso.writeFileSync('./classes-overall.json', JSON.stringify(newClasses, null, 2));
}

main();