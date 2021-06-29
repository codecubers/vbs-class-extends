
let SUB_NAME = /SUB[ \t]+((\w+)(?:[ \t]*\((?:[^\(\)]*)\))*)(.*)END SUB/igms
let FUNC_NAME = /FUNCTION[ \t]+((\w+)(?:[ \t]*\((?:[^\(\)]*)\))*)(.*)END FUNCTION/igms
let PROP_NAME = /PROPERTY[ \t]+(GET|SET|LET)[ \t]+((\w+)(?:[ \t]*\((?:[^\(\)]*)\))*)(.*)END PROPERTY/igms

let CLASS_NAME = /CLASS[ \t]+(\w+)(.*)END Class/igsm
let CLASS_EXTEND = /CLASS[\s]+(\w+)[\s]+(?:extends[\s]+(\w+))(.*)END Class/igsm

/**
 * Regular Expression to extract SUB routine signature
 * Group 1: Full signature of the Sub Routine Ex: public default SUB abc(kjkl, kljklj, sdfds, jkljlk, sdfsdf)
 * Group 2: Simple name of the Sub Routine Ex: abc
 * Group 3: List of paramters; NULL if sub does not have paranthesis (); EMPTY string if sub have paranthesis but no values passed
 * Note: Public/Private, Default will be included only if present
 * Link: https://regex101.com/r/5x7jdW/1
 */
let SUB =      /((?:(?:PUBLIC|PRIVATE)[ \t]+)*(?:(?:DEFAULT)[ \t]+)*SUB[ \t]+(?:(\w+)(?:[ \t]*\((?:[^\(\)]*)\))*))(?:.*)(END SUB)/igms

/**
 * Regular Expression to extract Function routine signature
 * Group 1: Full signature of the Function Routine Ex: public default Function abc(kjkl, kljklj, sdfds, jkljlk, sdfsdf)
 * Group 2: Simple name of the Function Routine Ex: abc
 * Group 3: List of paramters; NULL if Function does not have paranthesis (); EMPTY string if function have paranthesis but no values passed
 * Note: Public/Private, Default will be included only if present
 * Link: https://regex101.com/r/qJRozP/1
 */
let FUNCTION = /((?:(?:PUBLIC|PRIVATE)[ \t]+)*(?:(?:DEFAULT)[ \t]+)*FUNCTION[ \t]+(?:(\w+)(?:[\s]*\((?:[^\(\)]*)\))*))(?:.*)(END FUNCTION)/gims

/**
 * Regular Expression to extract property routine signature
 * Group 1: Full signature of the Property Routine Ex: public default Property Get abc(kjkl, kljklj, sdfds, jkljlk, sdfsdf)
 * Group 2: Simple name of the Property Routine Ex: abc
 * Group 3: List of paramters; NULL if Property does not have paranthesis (); EMPTY string if Property have paranthesis but no values passed
 * Note: Public/Private, Default will be included only if present
 * Link: https://regex101.com/r/nDz3Jh/1
 */
let PROPERTY = /((?:(?:PUBLIC|PRIVATE)[ \t]*)*(?:(?:DEFAULT)[ \t]*)*PROPERTY[ \t]+(?:GET|SET|LET)[ \t]+(?:(\w+)(?:[ \t]*\((?:[^\(\)]*)\))*))(?:.*)(END PROPERTY)/igms

let COMMENTS_NEWLINE = /(^[ \t]*(?:'(?:.*))$)/gm
let COMMENTS_INLINE_NO_QUOTES = /([ \t]*'(?:[^\n"])*$)/gm
let EMPTY_LINE_TWO_OR_MORE = /([ \t]*[\r\n]){3,}/gm

let EXTRACT_CLASSES = /((?:[\s]*EXTENDABLE)*[\s]*CLASS[\s]*(?:.*[\r\n])*?(?:.*)END CLASS[\s]*)/igm

module.exports = {
    SUB_NAME,
    FUNC_NAME,
    PROP_NAME,
    CLASS_NAME,
    CLASS_EXTEND,
    SUB,
    FUNCTION,
    PROPERTY,
    COMMENTS_NEWLINE,
    COMMENTS_INLINE_NO_QUOTES,
    EMPTY_LINE_TWO_OR_MORE,
    EXTRACT_CLASSES
}