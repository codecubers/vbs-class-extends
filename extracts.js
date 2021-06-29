const FUNC = require('./functions');
const RX = require('./constants');

let clsNoMethods;

const extractBody = (code, sign, end) => code.substring((code.indexOf(sign) + sign.length), code.indexOf(end));

function extract_methods(type, code, pub=false) {
    type = FUNC.typeCheck(type);
    if (type === 'UNKNOWN') throw new Error("Invalid method type supplied. Must be one of SUB/FUNCTION/PROPERTY.")
    
    let rx = (pub ? `[ \t]*PUBLIC[ \t]*` : `[ \t]*(?:PRIVATE)*[ \t]*`);
    rx += `((?:DEFAULT)*[ \t]*)${type}[ \t]+(?:.*[\r\n])*?(.*)END ${type}[ \t]*`;
    // console.log("rx:", rx)
    return code.match(new RegExp(rx, 'igmu'))
}

function extract_classes(code) {
    // var re = new RegExp('([\\s]*EXTENDABLE)*[\\s]*CLASS[\\s]*(?:.*[\\r\\n])*?(.*)END CLASS[\\s]*', 'igm');
    // var re = /((?:[\s]*EXTENDABLE)*[\s]*CLASS[\s]*(?:.*[\r\n])*?(?:.*)END CLASS[\s]*)/igm
    return code.match(RX.EXTRACT_CLASSES)
}

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

function extract_procedureSignature(index, code, type) {
    type = FUNC.typeCheck(type);
    if (type === 'UNKNOWN') throw new Error("Invalid type supplied. Must be one of SUB/FUNCTION/PROPERTY.");
    var re;
    if (type === 'SUB') re = RX.SUB
    else if (type === 'FUNCTION') re = RX.FUNCTION
    else if (type === 'PROPERTY') re = RX.PROPERTY
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
        // if (type === 'PROPERTY') console.log("re:", re)
        // if (type === 'PROPERTY') console.log('index:' + index + ' code:', code);
        m.forEach((match, groupIndex) => {
            // if (type === 'PROPERTY') console.log(`Found match, group ${groupIndex}: ${match}`);
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
    let _public = extract_methods(type, cls, true);
    if (_public) {
        _public.forEach((sub) => {
            let {name, sign, end} = extract_procedureSignature(index, sub, type);
            let _upper = name.toUpperCase();
            _methods[_upper] = {
                name: name,
                sign: sign,
                code: FUNC.compress(sub),
                end: end,
                body: extractBody(sub, sign, end),
                index: index,
                isPublic: true
            }
            index++;
            _clsRemaining = _clsRemaining.replace(sub, 'PUBLIC_' + type + '_' + _upper)
            clsNoMethods = clsNoMethods.replace(sub, '')
        })
    }
    let _private = extract_methods(type, cls, false);
    if (_private) {
        _private.forEach((sub) => {
            let {name, sign, end} = extract_procedureSignature(index, sub, type);
            let _upper = name.toUpperCase();
            if (!_methods.hasOwnProperty(_upper)) {
                _methods[_upper] = {
                    name: name,
                    sign: sign,
                    code: FUNC.compress(sub),
                    end: end,
                    body: extractBody(sub, sign, end),
                    index: index,
                    isPublic: false
                }
                index++;
                _clsRemaining = _clsRemaining.replace(sub, 'PRIVATE_' + type + '_' + _upper)
                clsNoMethods = clsNoMethods.replace(sub, '')
            }
        })
    }
    if (Object.keys(_methods).length > 0) _clsObj[type.toLowerCase() + 's'] = _methods;
    return _clsRemaining;
}

function extractVBSFileMethods(vbsBody) {
    let newClasses = [];
    vbsBody = FUNC.removeCommentsStart(vbsBody)
    vbsBody = FUNC.removeEmptyLines(vbsBody)
    let classes = extract_classes(vbsBody)
    classes.forEach((cls) => {
        let clsName = extract_className(cls);
        vbsBody = vbsBody.replace(cls, `CLASS_${clsName}`)
        let _class = {
            name: clsName,
            body: FUNC.compress(cls)
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
        clsNoMethods = cls;
        _structure = extractProcedures(cls, 'PROPERTY', _class, _structure)
        _structure = extractProcedures(cls, 'SUB', _class, _structure)
        _structure = extractProcedures(cls, 'FUNCTION', _class, _structure)
        _class.structure = _structure
        _class.noMethods = FUNC.removeEmptyLines(clsNoMethods);
        newClasses.push(_class)

    });
    return newClasses;
}

module.exports = {
    extractVBSFileMethods
}