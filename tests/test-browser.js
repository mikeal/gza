/* globals clean */
const path = require('path')
const cappadonna = require('cappadonna')
const test = cappadonna(path.join(__dirname, 'components.js'))

test('basic', async (page, t) => {
  t.plan(1)
  await page.appendAndWait('<test-one></test-one>', 'test-one render')
  await page.evaluate(async () => {
    t.same(clean(document.querySelector('test-one render').textContent), 'Test')
  })
})

test('default settings', async (page, t) => {
  t.plan(1)
  await page.appendAndWait(`<test-two></test-two>`, 'test-two render')
  await page.evaluate(async () => {
    t.same(clean(document.querySelector('test-two render').textContent), '2')
  })
})

test('set shadowDOM', async (page, t) => {
  t.plan(1)
  await page.appendAndWait(`<test-three></test-three>`, 'test-three render')
  await page.evaluate(async () => {
    let expected = `<style>test{font-size:50px;}</style>`
    t.same(clean(document.querySelector('test-three').shadowRoot.innerHTML), expected)
  })
})

test('template values', async (page, t) => {
  t.plan(1)
  await page.appendAndWait(`<test-four></test-four>`, 'test-four render')
  await page.evaluate(async () => {
    let expected = `test<div>2</div>`
    t.same(clean(document.querySelector('test-four render').innerHTML), expected)
  })
})

test('initialization functions', async (page, t) => {
  t.plan(1)
  await page.appendAndWait(`<test-five></test-five>`, 'test-five render')
  await page.evaluate(async () => {
    t.same(clean(document.querySelector('test-five render').textContent), '4')
  })
})

test('elment attributes for settings', async (page, t) => {
  t.plan(1)
  await page.appendAndWait(`<test-six test="5"></test-six>`, 'test-six render')
  await page.evaluate(async () => {
    t.same(clean(document.querySelector('test-six render').textContent), '5')
  })
})

test('shadowDOM templating', async (page, t) => {
  t.plan(1)
  await page.appendAndWait(`<test-seven test="5"></test-seven>`, 'test-seven render')
  await page.evaluate(async () => {
    let expected = `<style>test{font-size:5px;}</style>`
    t.same(clean(document.querySelector('test-seven').shadowRoot.innerHTML), expected)
  })
})

test('promises init/template/shadow', async (page, t) => {
  t.plan(4)
  await page.appendAndWait(`<test-eight></test-eight>`, 'test-eight render')
  await page.evaluate(async () => {
    let expected = `<style>test{font-size:3px;}</style>`
    t.same(clean(document.querySelector('test-eight').shadowRoot.innerHTML), expected)
    expected = '3'
    t.same(clean(document.querySelector('test-eight render').innerHTML), expected)
    document.querySelector('test-eight').test += 1
    setTimeout(async () => {
      expected = `<style>test{font-size:4px;}</style>`
      t.same(clean(document.querySelector('test-eight').shadowRoot.innerHTML), expected)
      expected = '4'
      t.same(clean(document.querySelector('test-eight render').innerHTML), expected)
      document.body.innerHTML += '<test-finished></test-finished>'
    }, 100)
  })
  await page.waitFor('test-finished')
})

test('element in template', async (page, t) => {
  t.plan(3)
  await page.appendAndWait(`<test-nine></test-nine>`, 'test-nine render')
  await page.evaluate(async () => {
    let expected = '<div></div><test-container>default</test-container>'
    t.same(clean(document.querySelector('test-nine render').innerHTML), expected)
    document.querySelector('test-nine').sub.textContent = 'pass'
    document.querySelector('test-container').innerHTML = 'pass'
    expected = '<div>pass</div><test-container>pass</test-container>'
    t.same(clean(document.querySelector('test-nine render').innerHTML), expected)
    document.querySelector('test-nine').i += 1
    setTimeout(async () => {
      expected = '<div>pass</div><test-container>default</test-container>'
      t.same(clean(document.querySelector('test-nine render').innerHTML), expected)
      document.body.innerHTML += '<test-finished></test-finished>'
    }, 100)
  })
  await page.waitFor('test-finished')
})

test('waitFor subelement', async (page, t) => {
  t.plan(2)
  await page.appendAndWait(`<test-ten></test-ten>`, 'test-ten render')
  await page.evaluate(async () => {
    setTimeout(async () => {
      let expected = '<renderslot="render"></render>'
      t.same(clean(document.querySelector('test-ten').innerHTML), expected)
      document.querySelector('test-ten').sub = document.createElement('test-finished')
    }, 100)
  })
  await page.waitFor('test-finished')
  await page.evaluate(async () => {
    let expected = '<renderslot="render"><test-finished></test-finished><t-1></t-1></render>'
    t.same(clean(document.querySelector('test-ten').innerHTML), expected)
  })
})

test('dyanmically addSetting in init', async (page, t) => {
  t.plan(3)
  await page.appendAndWait(`<test-eleven></test-eleven>`, 'test-eleven render')
  await page.evaluate(async () => {
    let expected = '<button></button>'
    t.same(clean(document.querySelector('test-eleven render').innerHTML), expected)
    document.querySelector('test-eleven render button').click()
    expected = '<button>0</button>'
    document.querySelector('test-eleven').i += 1
    setTimeout(async () => {
      expected = '<button>0</button>'
      t.same(clean(document.querySelector('test-eleven render').innerHTML), expected)
      document.querySelector('test-eleven render button').click()
      expected = '<button>1</button>'
      t.same(clean(document.querySelector('test-eleven render').innerHTML), expected)
      document.body.innerHTML += '<test-finished></test-finished>'
    }, 100)
  })
  await page.waitFor('test-finished')
})

test('dynamic arrays from settings', async (page, t) => {
  t.plan(2)
  await page.appendAndWait(`<test-twelve></test-twelve>`, 'test-twelve render')
  await page.evaluate(async () => {
    let expected = '<top><pre></pre></top>'
    t.same(clean(document.querySelector('test-twelve render').innerHTML), expected)
    document.querySelector('test-twelve').arr.push('<next></next>')
    setTimeout(async () => {
      expected = '<top><pre></pre><next></next></top>'
      t.same(clean(document.querySelector('test-twelve render').innerHTML), expected)
      document.body.innerHTML += '<test-finished></test-finished>'
    }, 100)
  })
  await page.waitFor('test-finished')
})
