
let SUB_NAME = /SUB[ \t]+((\w+)(?:[ \t]*\((?:[^\(\)]*)\))*)(.*)END SUB/igms
let FUNC_NAME = /FUNCTION[ \t]+((\w+)(?:[ \t]*\((?:[^\(\)]*)\))*)(.*)END FUNCTION/igms
let PROP_NAME = /PROPERTY[ \t]+(GET|SET|LET)[ \t]+((\w+)(?:[ \t]*\((?:[^\(\)]*)\))*)(.*)END PROPERTY/igms

let CLASS_NAME = /CLASS[ \t]+(\w+)(.*)END Class/igsm
let CLASS_EXTEND = /CLASS[\s]+(\w+)[\s]+(?:extends[\s]+(\w+))(.*)END Class/igsm

/**
 * Regular Expression to extract SUB routine signature and components
 
 * Note: Public/Private, Default will be included only if present
 * Link: https://regex101.com/r/5x7jdW/1
 * 
 * [Public [Default] | Private] Sub name [(arglist)] 
 *   [statements]
 *   [Exit Sub]
 *   [statements]
 * End Sub
 * https://docs.microsoft.com/en-us/previous-versions//tt223ahx(v=vs.85)
 */
let SUB = /((?:(?:PUBLIC|PRIVATE)[ \t]+)*(?:(?:DEFAULT)[ \t]+)*(SUB)[ \t]+((?:(\w+)(?:[ \t]*(\(([^\(\)]*)\))*))))(?:.*)(END SUB)/igms

/**
 * Regular Expression to extract Function routine signature
 * Group 1: Full signature of the Function Routine Ex: public default Function abc(kjkl, kljklj, sdfds, jkljlk, sdfsdf)
 * Group 2: Simple name of the Function Routine Ex: abc
 * Group 3: List of paramters; NULL if Function does not have paranthesis (); EMPTY string if function have paranthesis but no values passed
 * Note: Public/Private, Default will be included only if present
 * Link: https://regex101.com/r/qJRozP/1
 * 
 * [Public [Default] | Private] Function name [(arglist)]
 *   [statements]
 *   [name = expression]
 *   [Exit Function] 
 *   [statements]
 *   [name = expression]
 * End Function 
https://docs.microsoft.com/en-us/previous-versions//x7hbf8fa(v=vs.85)
 */
let FUNCTION = /((?:(?:PUBLIC|PRIVATE)[ \t]+)*(?:(?:DEFAULT)[ \t]+)*(FUNCTION)[ \t]+((?:(\w+)(?:[ \t]*(\(([^\(\)]*)\))*))))(?:.*)(END FUNCTION)/gims

/**
 * Regular Expression to extract property routine signature
 * Group 1: Full signature of the Property Routine Ex: public default Property Get abc(kjkl, kljklj, sdfds, jkljlk, sdfsdf)
 * Group 2: Simple name of the Property Routine Ex: abc
 * Group 3: List of paramters; NULL if Property does not have paranthesis (); EMPTY string if Property have paranthesis but no values passed
 * Examples: [1]                          , [2]         , [3]       , [4]     , [5] , [6] , [7]
 *           Public Property Get PubProp(), Property Get, PubProp() , PubProp , ()  ,     , End Property
 * Note: Public/Private, Default will be included only if present
 * Link: https://regex101.com/r/nDz3Jh/1
 * 
 * [Public [Default] | Private] Property Get name [(arglist)]
 *    [statements]
 *    [[Set] name = expression]
 *    [Exit Property] 
 *    [statements]
 *    [[Set] name = expression]
 * End Property 
 * https://docs.microsoft.com/en-us/previous-versions//613k2d48(v=vs.85)?redirectedfrom=MSDN
 * 
 * [Public | Private] Property Let name ([arglist,] value)
 *   [statements]
 *   [Exit Property] 
 *   [statements]
 * End Property 
 * https://docs.microsoft.com/en-us/previous-versions//77kezfet(v=vs.85)
 * 
 * [Public | Private] Property Set name([arglist,] reference)
 *   [statements]
 *   [Exit Property] 
 *   [statements]
 * End Property 
 * https://docs.microsoft.com/en-us/previous-versions//zzhy86w7(v=vs.85)
 */
let PROPERTY = /((?:(?:PUBLIC|PRIVATE)[ \t]*)*(?:(?:DEFAULT)[ \t]+)*PROPERTY[ \t]+((?:GET|SET|LET))[ \t]+((?:(\w+)(?:[ \t]*(\(([^\(\)]*)\))*))))(?:.*)(END PROPERTY)/igms

let COMMENTS_NEWLINE = /(^[ \t]*(?:'(?:.*))$)/gm
let COMMENTS_INLINE_NO_QUOTES = /([ \t]*'(?:[^\n"])*$)/gm
let EMPTY_LINE_TWO_OR_MORE = /([ \t]*[\r\n]){3,}/gm

let EXTRACT_CLASSES = /([\s]*CLASS[\s]*(?:.*[\r\n])*?(?:.*)END CLASS[\s]*)/igm

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