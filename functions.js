var _lz = require('lz-string');
const RX = require('./constants');

const compress = (str) => str; //_lz.compressToBase64(str);
const deCompress = (str) => str; //_lz.decompressFromBase64(str);

const removeCommentsStart = (code) => code.replace(RX.COMMENTS_NEWLINE, '').replace(RX.COMMENTS_INLINE_NO_QUOTES, '');
const removeEmptyLines = (code) => code.replace(RX.EMPTY_LINE_TWO_OR_MORE, '\n\n');

function typeCheck(type) {
    type = type.trim().toUpperCase();
    return ['FUNCTION', 'SUB', 'PROPERTY'].includes(type) ? type : 'UNKNOWN';
}

const appendMethod = (cls, m) => cls.replace('End Class', `\n${m}\nEnd Class`)

const addSuperPublicMethods = ( structure, arrMethods, type, superClsName ) => {
    if (!arrMethods) return structure;
    Object.values(arrMethods).forEach((method) => {
        let {name, sign, isPublic, end, absName} = method
        let superCall = (absName) ? absName : name;
        if (isPublic) {
            let _sign = `Public ${type} ${sign.substring(sign.indexOf(name))}`;
            let callSuper = `${name} = m_${superClsName}.${superCall}`
            if (type.includes(' Let ')) {
                callSuper = `m_${superClsName}.${name} = ${callSuper.replace(name, '')}`
            } else if (type.includes(' Set ')) {
                callSuper = `set m_${superClsName}.${name} = ${callSuper.replace(name, '')}`
            } else if (type === 'Sub') {
                callSuper = `call m_${superClsName}.${superCall}`
            }
            let method = `    ${sign}\n        ${callSuper}\n    ${end}`;
            structure = appendMethod(structure, method)
        }
    })
    return structure;
}

/**
 * 
 * @param data items array
 * @param idKey item's id key (e.g., item.id)
 * @param parentIdKey item's key that points to parent (e.g., item.parentId)
 * @param noParentValue item's parent value when root (e.g., item.parentId === noParentValue => item is root)
 * @param bidirectional should parent reference be added
 */
 function flatToTree(data, idKey, parentIdKey, noParentValue = null, bidirectional = true) {
    const nodes = {}, roots = {}, leaves = {};
  
    // iterate over all data items
    for (const i of data) {
  
      // add item as a node and possibly as a leaf
      if (nodes[i[idKey]]) { // already seen this item when child was found first
        // add all of the item's data and found children
        nodes[i[idKey]] = Object.assign(nodes[i[idKey]], i);
      } else { // never seen this item
        // add to the nodes map
        nodes[i[idKey]] = Object.assign({ $children: []}, i);
        // assume it's a leaf for now
        leaves[i[idKey]] = nodes[i[idKey]];
      }
  
      // put the item as a child in parent item and possibly as a root
      if (i[parentIdKey] !== noParentValue) { // item has a parent
        if (nodes[i[parentIdKey]]) { // parent already exist as a node
          // add as a child
          (nodes[i[parentIdKey]].$children || []).push( nodes[i[idKey]] );
        } else { // parent wasn't seen yet
          // add a "dummy" parent to the nodes map and put the item as its child
          nodes[i[parentIdKey]] = { $children: [ nodes[i[idKey]] ] };
        }
        if (bidirectional) {
          // link to the parent
          nodes[i[idKey]].$parent = nodes[i[parentIdKey]];
        }
        // item is definitely not a leaf
        delete leaves[i[parentIdKey]];
      } else { // this is a root item
        roots[i[idKey]] = nodes[i[idKey]];
      }
    }
    return {roots, nodes, leaves};
  }

module.exports = {
    compress,
    deCompress,
    removeCommentsStart,
    removeEmptyLines,
    typeCheck,
    appendMethod,
    addSuperPublicMethods,
    flatToTree
}