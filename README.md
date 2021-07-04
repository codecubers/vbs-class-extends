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