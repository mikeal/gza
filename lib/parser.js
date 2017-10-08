const flat = string => string.replace(/ /g, '')

const findClose = (str, tagName) => {
  let i = str.indexOf('<')
  while (i !== -1) {
    let tag = flat(str.slice(i, str.indexOf('>', i)))
    if (tag === `</${tagName}`) return i
    i = str.indexOf('<', i + 1)
  }
  throw new Error(`Cannot find close position for tagName: ${tagName}`)
}

const parser = (strings, keys) => {
  let str = strings.join('')
  let elementOpen = str.indexOf('<')
  let elementClose = str.indexOf('>')
  let tagName = flat(str.slice(elementOpen + 1, elementClose))
  let templateOpen = elementClose + 1
  let templateClose = findClose(str, tagName)
  let shadowOpen = str.indexOf('>', templateClose + 1) + 1

  let defaults = {}
  let constructors = []

  let templateInserts = []
  let shadowInserts = []
  let pos = 0
  for (let i = 0; i < keys.length; i++) {
    pos = (pos + strings[i].length)
    if (pos <= elementOpen) constructors.push(keys[i])
    else if (pos <= elementClose) defaults = keys[i]
    else if (pos <= shadowOpen) templateInserts.push([pos, keys[i]])
    else shadowInserts.push([pos, keys[i]])
  }

  let template = []
  let shadow = []

  let i = templateOpen
  while (templateInserts.length) {
    let [pos, insert] = templateInserts.shift()
    template.push(str.slice(i, pos))
    template.push(insert)
    i = pos
  }
  template.push(str.slice(i, templateClose))

  i = shadowOpen
  while (shadowInserts.length) {
    let [pos, insert] = shadowInserts.shift()
    shadow.push(str.slice(i, pos))
    shadow.push(insert)
    i = pos
  }
  shadow.push(str.slice(i))

  return {
    constructors,
    tagName,
    defaults,
    template,
    shadow
  }
}

module.exports = parser
