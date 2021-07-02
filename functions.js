var _lz = require('lz-string');
var yallist = require('yallist');
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

const addSuperPublicMethods = (structure, arrMethods, type, superClsName) => {
  if (!arrMethods) return structure;
  Object.values(arrMethods).forEach((method) => {
    let { name, sign, isPublic, end, absName, params, params2, body } = method
    if (isPublic) {
      // let _sign = `Public ${type} ${sign.substring(sign.indexOf(name))}`;
      let callSuper = `${name} = m_${superClsName}.${absName}`

      if (params) {
        callSuper += params
      }

      if (type === 'Sub') {
        callSuper = `call m_${superClsName}.${absName}`
        if (params) callSuper += params
      }

      else if (type === 'Property') {

        if (sign.includes(' Let ')) {
          callSuper = `m_${superClsName}.${absName} = ${params2}`
        }

        else if (sign.includes(' Set ')) {
          callSuper = `set m_${superClsName}.${absName} = ${params2}`
        }

        else if (sign.includes(' Get ')) {
          let re = new RegExp(`[\\s]+set[\\s]+${absName}[\\s]*=[\\s]*`, 'igsm');
          if (body.match(re)) {
            callSuper = `set ${absName} = m_${superClsName}.${absName}`
          } else {
            callSuper = `${absName} = m_${superClsName}.${absName}`
          }
          if (params) callSuper += params
        }
      }
      let method = `    ${sign}\n        ${callSuper}\n    ${end}`;
      structure = appendMethod(structure, method)
    }
  })
  return structure;
}

function extendClass(child, parent) {
  let { extendsClass, subs, functions, propertys, noMethods } = child;

  let constructor;
  if (subs && subs.CLASS_INITIALIZE) constructor = subs.CLASS_INITIALIZE;
  if (!constructor) {
    constructor = {
      sign: "Private Sub Class_Initialize",
      end: "End Sub",
      body: ""
    }
  }
  let { sign, end, body } = constructor;
  let method = `\n\n    Private m_${extendsClass}\n\n`
  method += `    ${sign}\n        set m_${extendsClass} = new ${extendsClass}`;
  if (body) method += `\n\t\t${body}`
  method += `\n    ${end}\n\n`
  noMethods = appendMethod(noMethods, method)

  noMethods = addSuperPublicMethods(noMethods, parent.subs, "Sub", extendsClass)
  noMethods = addSuperPublicMethods(noMethods, parent.functions, "Function", extendsClass)
  noMethods = addSuperPublicMethods(noMethods, parent.propertys, "Property", extendsClass)

  if (propertys) Object.values(propertys).forEach(method => noMethods = appendMethod(noMethods, method.code))
  if (functions) Object.values(functions).forEach(method => noMethods = appendMethod(noMethods, method.code))
  if (subs) {
    Object.entries(subs).forEach(([subNameUpper, sub]) => {
      if (subNameUpper === 'CLASS_INITIALIZE') {
        noMethods = appendMethod(noMethods, '')
      } else {
        noMethods = appendMethod(noMethods, sub.code)
      }
    })
  }
  return noMethods;
}

/**
 * https://stackoverflow.com/a/64623332/1751166
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
      nodes[i[idKey]] = Object.assign({ $children: [] }, i);
      // assume it's a leaf for now
      leaves[i[idKey]] = nodes[i[idKey]];
    }

    // put the item as a child in parent item and possibly as a root
    if (i[parentIdKey] !== noParentValue) { // item has a parent
      if (nodes[i[parentIdKey]]) { // parent already exist as a node
        // add as a child
        (nodes[i[parentIdKey]].$children || []).push(nodes[i[idKey]]);
      } else { // parent wasn't seen yet
        // add a "dummy" parent to the nodes map and put the item as its child
        nodes[i[parentIdKey]] = { $children: [nodes[i[idKey]]] };
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
  return { roots, nodes, leaves };
}

async function getChildLineage(child, nodes) {
  return new Promise((resolve, reject) => {  
    let myList = yallist.create()
    myList.push(child)
    let limit = 20
    while (nodes.hasOwnProperty(child) && nodes[child].parent && limit > 0) {
      myList.push(nodes[child].parent)
      child = nodes[child].parent;
      limit--;
    }
    if (limit <= 0) {
      console.log(myList.toArray().join(' -- (extends) --> '))
      // throw new Error(`More than 20 levels of class extension detected. Possible circular extension. Please fix and try again.`)
      reject(`More than 20 levels of class extension detected. Possible circular extension. Please fix and try again.`)
    } else {
      myList.reverse()
      resolve(myList.toArray())
    }
  })
}

async function resolveExtendingClasses(extending, classObjects) {
    let { nodes, leaves } = flatToTree(extending, 'child', 'parent', null, false);
    return Object.keys(leaves).reduce(async (obj, leave) => {
      let arr = await getChildLineage(leave, nodes);
      for (let index = 1; index < arr.length; index++) {
        const _parent = arr[index - 1];
        const _child = arr[index];
        obj[_child] = extendClass(classObjects[_child], classObjects[_parent])
      }
      return obj;
    }, {});
}

module.exports = {
  compress,
  deCompress,
  removeCommentsStart,
  removeEmptyLines,
  typeCheck,
  appendMethod,
  addSuperPublicMethods,
  extendClass,
  resolveExtendingClasses
}