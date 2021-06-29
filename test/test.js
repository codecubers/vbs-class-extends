const regex = /((?:(?:PUBLIC|PRIVATE)[\s]+)*(?:(?:DEFAULT)[\s]+)*FUNCTION[\s]+(?:(\w+)(?:[\s]*\(([^\(\)]*)\))*))(?:.*)END FUNCTION/gims;
const str = `
code:   public function getName
                getName = "Nto overridden"
        End Function
ERROR while exracting signature`;
let m;

while ((m = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
        regex.lastIndex++;
    }
    
    // The result can be accessed through the `m`-variable.
    m.forEach((match, groupIndex) => {
        console.log(`Found match, group ${groupIndex}: ${match}`);
    });
}