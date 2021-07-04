# vbs-method-parser

Resolve extended classes in vbscript


## Usage

```sh
npm install @vbsnext/vbs-class-extends
```


```js
'use strict';
const fs = require('fs');
const extendVbsClasses = require('@vbsnext/vbs-class-extends');

let inVbs = 'vbsclasses-unresolved.vbs';
let outVbs = 'vbsclasses-resolved.vbs';

// Read the vbs script file 
let source = fs.readFileSync(inVbs).toString();
// Resolve 'Class A extends B' within file
extendVbsClasses(source).then((resolved)=>{
    console.log('Extended classes resolved successfully.')
    //If no classes extended; the resolved will be the original source.
    fs.writeFileSync(outVbs, resolved);
}).catch((error)=>{
    console.error(error)
})
```

A simple vbscript file below code ("Class B extends A")
```vbscript
Class A
  public Sub hi
    Wscript.Echo "I'm in Class A"
  End Sub
End Class

Class B extends A
  
End Class

dim cb
set cb = new B
call cb.hi
```

woule be resolved to... Allowing Class B auto-popualte with public methods from Class A.

```vbscript
Class A
  public Sub hi
    Wscript.Echo "I'm in Class A"
  End Sub
End Class



Class B

    Private m_A

    Private Sub Class_Initialize
        set m_A = new A
    End Sub

    public Sub hi
        call m_A.hi
    End Sub
End Class



dim cb
set cb = new B
call cb.hi
```