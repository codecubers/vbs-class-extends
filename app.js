'use strict';
//Object.defineProperty(exports, "__esModule", { value: true });
function extract_functions(code, pub = false) {
    let rx = (pub ? '[ \t]*PUBLIC[ \t]+' : '[ \t]*(?:PRIVATE|PROTECTED)*[ \t]*') + 'FUNCTION[ \t]+(?:.*[\r\n])*?(.*)END FUNCTION[ \t]*'
    var re = new RegExp(rx, 'igm');
    return code.match(re)
}
function extract_subs(code, pub = false) {
    let rx = (pub ? '[ \t]*PUBLIC[ \t]+' : '[ \t]*(?:PRIVATE|PROTECTED)*[ \t]*') + 'SUB[ \t]+(?:.*[\r\n])*?(.*)END SUB[ \t]*'
    var re = new RegExp(rx, 'igm');
    return code.match(re)
}
function extract_props(code, pub = false) {
    let rx = (pub ? '[ \t]*PUBLIC[ \t]+' : '[ \t]*(?:PRIVATE|PROTECTED)*[ \t]*') + 'PROPERTY[ \t]+(?:GET|LET|SET)(?:.*[\r\n])*?(.*)END PROPERTY[ \t]*'
    var re = new RegExp(rx, 'igm');
    return code.match(re)
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
function extract_procedureName(index, code, type='SUB') {
    // console.log('searching class name in:' + code)
    let i = (type === 'PROPERTY') ? 2 : 1;
    var re;
    if (type === 'SUB') re = /SUB[ \t]+(\w+)(.*)END SUB/igsm
    if (type === 'FUNCTION') re = /FUNCTION[ \t]+(\w+)(.*)END FUNCTION/igsm
    if (type === 'PROPERTY') re = /PROPERTY[ \t]+(GET|SET|LET)[ \t]+(\w+)(.*)END PROPERTY/igsm
    var match = re.exec(code);
    if (match) return (type === 'PROPERTY') ? match[i] + '.' + match[1] : match[i];
    return index;
}

function extractProcedures(cls, type, funcMethod, funcName, _clsObj, _clsRemaining) {
    let _public = funcMethod(cls, true);
    if (_public) {
        _public.forEach((sub, index) => {
            let _name = funcName(index, sub, type);
            console.log('name-public:', _name);
            _clsObj[_name] = {
                code: sub,
                index: index,
                isPublic: true
            }
            //console.log('before2:', _clsRemaining)
            _clsRemaining = _clsRemaining.replace(sub, 'PUBLIC_' + type + '_' + _name)
            //console.log('after2:', _clsRemaining)
        })
    }
    let _private = funcMethod(cls, false);
    if (_private) {
        _private.forEach((sub, index) => {
            let _name = funcName(index, sub, type);
            if (!_clsObj.hasOwnProperty(_name)) {
                console.log('name-private:', _name);
                _clsObj[_name] = {
                    code: sub,
                    index: index,
                    isPublic: false
                }
                //console.log('before1:', _clsRemaining)
                _clsRemaining = _clsRemaining.replace(sub, 'PRIVATE_' + type + '_' + _name)
                //console.log('after1:', _clsRemaining)
            }
        })
    }
    return _clsRemaining;
}
const fso = require('fs');
let sample = fso.readFileSync('C:\\Users\\nanda\\git\\xps.local.npm\\vbs-excel-unpack\\build\\export-bundle.vbs').toString();
// console.log(sample)
let temp = sample;
let classes = extract_classes(sample)
// console.log(extract_className(sample))
let i = 0
let newClasses = []
// let classFiles = {}
classes.forEach(cls => {
    let clsName = extract_className(cls);
    // console.log(`class ${clsName}:`)
    cls = removeCommentsStart(cls)
    let _class = {
        name: clsName
    }
    let ext = classExtends(cls);
    if (ext) {
        let { base, _extends } = ext;
        _class.extends = _extends
        // console.log(`class ${base} extends ${_extends}`)
    }
    _class.body = cls
    // fso.writeFileSync('class-' + clsName + ".vbs",  cls)
    // classFiles[clsName] = cls;
    // console.log(cls)


    // console.log('\r\npublic methods:')
    let _clsTemp = cls;
    //let _pubProps = extract_props(cls, true);
    //if (_pubProps) {
    //    _class.pubProps = _pubProps;
    //    _pubProps.forEach((prop, index) => {
    //        _clsTemp = _clsTemp.replace(prop, 'PUB_PROP_' + extract_procedureName(index, prop, 'PROPERTY'))
    //    })
    //}
    let arrProps = {}
    _clsTemp = extractProcedures(cls, 'PROPERTY', extract_props, extract_procedureName, arrProps, _clsTemp)
    if (arrProps) _class.property = arrProps;
    let arrSubs = {}
    //let _allSubs = extract_subs(cls, false);
    //if (_allSubs) {
    //    _allSubs.forEach((sub, index) => {
    //        arrSubs[extract_procedureName(index, sub, 'SUB')] = {
    //            code: sub,
    //            index: index,
    //            isPublic: false
    //        }
    //        _clsTemp = _clsTemp.replace(sub, 'PRIVATE_SUB_' + extract_procedureName(index, sub, 'SUB'))
    //    })
    //}
    //let _pubSubs = extract_subs(cls, true);
    //if (_pubSubs) {
    //    _pubSubs.forEach((sub, index) => {
    //        arrSubs[extract_procedureName(index, sub, 'SUB')] = {
    //            code: sub,
    //            index: index,
    //            isPublic: true
    //        }
    //        _clsTemp = _clsTemp.replace(sub, 'PUB_SUB_' + extract_procedureName(index, sub, 'SUB'))
    //    })
    //}
    _clsTemp = extractProcedures(cls, 'SUB', extract_subs, extract_procedureName, arrSubs, _clsTemp)
    if (arrSubs) _class.sub = arrSubs;

    let arrFuncs = {}
    _clsTemp = extractProcedures(cls, 'FUNCTION', extract_functions, extract_procedureName, arrFuncs, _clsTemp)
    if (arrFuncs) _class.function  = arrFuncs ;
    //let _pubFuns = extract_functions(cls, true);
    //if (_pubFuns) {
    //    _class.pubFuncs = _pubFuns;
    //    _pubFuns.forEach((fun, index) => {
    //        _clsTemp = _clsTemp.replace(fun, 'PUB_FUN_' + extract_procedureName(index, fun, 'FUNC'))
    //    })
    //}
    //TODO: Extract class initialize and terminates
    //TODO: extract private sub/function/properties


    _class.structure = _clsTemp
    newClasses.push(_class)

    temp = temp.replace(cls, ``)
});

// console.log(Object.keys(classFiles))

// console.log(`remaining: ${temp}`)
fso.writeFileSync('./remaining.vbs', temp)
// console.log(extract_subs(temp))
// console.log(extract_functions(temp));

fso.writeFileSync('./classes-overall.json', JSON.stringify(newClasses, null, 2));