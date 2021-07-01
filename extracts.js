const FUNC = require('./functions');
const RX = require('./constants');

let g_clsNoMethods;

const extractBody = (code, sign, end) => code.substring((code.indexOf(sign) + sign.length), code.indexOf(end));

function extract_methods(type, code, pub = false) {
    type = FUNC.typeCheck(type);
    if (type === 'UNKNOWN') throw new Error("Invalid method type supplied. Must be one of SUB/FUNCTION/PROPERTY.")

    let rx = (pub ? `[ \t]*PUBLIC[ \t]*` : `[ \t]*(?:PRIVATE)*[ \t]*`);
    rx += `((?:DEFAULT)*[ \t]*)${type}[ \t]+(?:(GET|SET|LET)[ \t]*)*(?:.*[\r\n])*?(.*)END ${type}[ \t]*`;
    return code.match(new RegExp(rx, 'igmu'))
}

function extract_classes(code) {
    return code.match(RX.EXTRACT_CLASSES)
}

function classExtends(code) {
    var re = /CLASS[\s]+(\w+)[\s]+(?:extends[\s]+(\w+))(.*)END Class/igsm
    var match = re.exec(code);
    return match ? { base: match[1], _extends: match[2] } : null
}

function extract_className(code) {
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
    let match = [];
    while ((m = re.exec(code)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === re.lastIndex) {
            re.lastIndex++;
        }

        m.forEach((_match, groupIndex) => {
            match.push(_match)
        });
    }
    let out = {
        name: `${type}_${index}`
    }
    if (match) {
        out.sign = match[1];
        out.absName = match[4]
        if (type === 'PROPERTY') {
            out.name = match[4] + '.' + match[2];
        } else {
            out.name = match[4];
        }
        out.params = match[5]
        out.params2 = match[6]
        out.end = match[7]
    } else {
        console.log("ERROR while exracting signature")
        console.log("re: ", re)
        console.log("code:", code)
    }
    return out;
}

//TODO: Combine these two sections
function extractProcedures(cls, type, _clsObj, _clsRemaining) {
    let index = 1;
    let _methods = {}
    let _public = extract_methods(type, cls, true);
    if (_public) {
        _public.forEach((sub) => {
            let { name, sign, end, absName, params, params2 } = extract_procedureSignature(index, sub, type);
            let _upper = name.toUpperCase();
            _methods[_upper] = {
                name, sign, end, absName, params, params2,
                code: FUNC.compress(sub),
                body: extractBody(sub, sign, end),
                index: index,
                isPublic: true
            }
            index++;
            _clsRemaining = _clsRemaining.replace(sub, 'PUBLIC_' + type + '_' + _upper)
            g_clsNoMethods = g_clsNoMethods.replace(sub, '')
        })
    }
    let _private = extract_methods(type, cls, false);
    if (_private) {
        _private.forEach((sub) => {
            let { name, sign, end, absName, params, params2 } = extract_procedureSignature(index, sub, type);
            let _upper = name.toUpperCase();
            // since private method can be defined without 'private';
            // first we are capturing all public method in above if condition
            // and then adding only remaining methods
            if (!_methods.hasOwnProperty(_upper)) {
                _methods[_upper] = {
                    name, sign, end, absName, params, params2,
                    code: FUNC.compress(sub),
                    body: extractBody(sub, sign, end),
                    index: index,
                    isPublic: false
                }
                index++;
                _clsRemaining = _clsRemaining.replace(sub, 'PRIVATE_' + type + '_' + _upper)
                g_clsNoMethods = g_clsNoMethods.replace(sub, '')
            }
        })
    }
    if (Object.keys(_methods).length > 0) _clsObj[type.toLowerCase() + 's'] = _methods;
    return _clsRemaining;
}

function extractVBSFileMethods() {
    let newClasses = [];
    global.master = FUNC.removeCommentsStart(global.master)
    global.master = FUNC.removeEmptyLines(global.master)
    let classes = extract_classes(global.master)
    classes.forEach((cls) => {
        let clsName = extract_className(cls);
        global.master = global.master.replace(cls, `\tCLASS_${clsName}\n\n`)

        let _class = {
            name: clsName,
            body: FUNC.compress(cls)
        }

        let ext = classExtends(cls);
        if (ext) {
            let { base, _extends } = ext;
            _class.isExtends = true;
            _class.extendsClass = _extends
        }

        let _structure = cls;
        g_clsNoMethods = cls;

        _structure = extractProcedures(cls, 'PROPERTY', _class, _structure)
        _structure = extractProcedures(cls, 'SUB', _class, _structure)
        _structure = extractProcedures(cls, 'FUNCTION', _class, _structure)
        _class.structure = _structure

        _class.noMethods = FUNC.removeEmptyLines(g_clsNoMethods);

        newClasses.push(_class)

    });
    return newClasses;
}

module.exports = {
    extractVBSFileMethods
}