const { test } = require('tap')
const parse = require('../lib/parser')

const gza = (strings, ...keys) => parse(strings, keys)

test('no options', t => {
  t.plan(5)
  let ret = gza`
  <test-one>
  </test-one>
  `
  t.same(ret.tagName, 'test-one')
  t.same(ret.constructors, [])
  t.same(ret.defaults, {})
  t.same(ret.template.join(''), '\n  ')
  t.same(ret.shadow.join(''), '\n  ')
})

test('defaults', t => {
  t.plan(5)
  let ret = gza`<test-two ${{test: 2}}></test-two>`
  t.same(ret.tagName, 'test-two')
  t.same(ret.defaults, {test: 2})
  t.same(ret.constructors, [])
  t.same(ret.template.join(''), '')
  t.same(ret.shadow.join(''), '')
})

test('shadow dom', t => {
  t.plan(5)
  let ret = gza`
  <test-three>
  </test-three>
  <style>test</style>
  `
  t.same(ret.tagName, 'test-three')
  t.same(ret.constructors, [])
  t.same(ret.defaults, {})
  t.same(ret.template.join(''), '\n  ')
  t.same(ret.shadow.join(''), '\n  <style>test</style>\n  ')
})

const getTemplate = ret => {
  return ret.template.map(t => {
    if (typeof t === 'string') return t
    return t(ret.defaults)
  }).join('')
}

const getShadow = ret => {
  return ret.shadow.map(t => {
    if (typeof t === 'string') return t
    return t(ret.defaults)
  }).join('')
}

test('template functions', t => {
  t.plan(5)
  let ret = gza`
  <test-four ${{test: 2}}>
    ${/* istanbul ignore next */() => {}}
    <div>${settings => settings.test}</div>
  </test-four>
  `
  t.same(ret.tagName, 'test-four')
  t.same(ret.constructors, [])
  t.same(ret.defaults, {test: 2})
  t.same(getTemplate(ret), '\n    \n    <div>2</div>\n  ')
  t.same(getShadow(ret), '\n  ')
})

test('constructors', t => {
  t.plan(5)
  let ret = gza`
  ${/* istanbul ignore next */() => {}}
  ${/* istanbul ignore next */() => {}}
  <test-five ${{test: 2}}>
    ${/* istanbul ignore next */() => {}}
    <div>${settings => settings.test}</div>
  </test-five>
  `
  t.same(ret.tagName, 'test-five')
  t.same(ret.constructors.length, 2)
  t.same(ret.defaults, {test: 2})
  t.same(getTemplate(ret), '\n    \n    <div>2</div>\n  ')
  t.same(getShadow(ret), '\n  ')
})

test('kitchen sink', t => {
  t.plan(5)
  let ret = gza`
  ${/* istanbul ignore next */() => {}}
  ${/* istanbul ignore next */() => {}}
  <test-kitchen ${{test: 2}}>
    ${/* istanbul ignore next */() => {}}
    <div>${settings => settings.test}</div>
  </test-kitchen><div>${settings => settings.test}</div>`

  t.same(ret.tagName, 'test-kitchen')
  t.same(ret.constructors.length, 2)
  t.same(ret.defaults, {test: 2})
  t.same(getTemplate(ret), '\n    \n    <div>2</div>\n  ')
  t.same(getShadow(ret), '<div>2</div>')
})

test('errors', t => {
  t.plan(2)
  try {
    gza`<my-element>`
  } catch (e) {
    t.type(e, 'Error')
    t.same(e.message, 'Cannot find close position for tagName: my-element')
  }
})
