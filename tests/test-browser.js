/* globals clean */
const path = require('path')
const cappadonna = require('cappadonna')
const test = cappadonna(path.join(__dirname, 'components.js'))

test('basic', async (page, t) => {
  t.plan(1)
  await page.evaluate(async () => {
    document.body.innerHTML += '<test-one></test-one>'
    let el = await document.querySelector('test-one').nextRender()
    t.same(clean(el.textContent), 'Test')
  })
})

test('default settings', async (page, t) => {
  t.plan(1)
  await page.evaluate(async () => {
    document.body.innerHTML += '<test-two></test-two>'
    let el = await document.querySelector('test-two').nextRender()
    t.same(clean(el.textContent), '2')
  })
})

test('set shadowDOM', async (page, t) => {
  t.plan(1)
  await page.evaluate(async () => {
    document.body.innerHTML += `<test-three></test-three>`
    let el = await document.querySelector('test-three')
    await el.nextRender()
    let expected = `<style>test{font-size:50px;}</style>`
    t.same(clean(el.shadowRoot.innerHTML), expected)
  })
})

test('template values', async (page, t) => {
  t.plan(1)
  await page.evaluate(async () => {
    document.body.innerHTML += '<test-four></test-four>'
    let el = await document.querySelector('test-four').nextRender()
    let expected = `test<div>2</div>`
    t.same(clean(el.innerHTML), expected)
  })
})

test('initialization functions', async (page, t) => {
  t.plan(1)
  await page.evaluate(async () => {
    document.body.innerHTML += '<test-five></test-five>'
    let el = await document.querySelector('test-five').nextRender()
    t.same(clean(el.textContent), '4')
  })
})

test('elment attributes for settings', async (page, t) => {
  t.plan(1)
  await page.evaluate(async () => {
    document.body.innerHTML += `<test-six test="5"></test-six>`
    let el = await document.querySelector('test-six').nextRender()
    t.same(clean(el.textContent), '5')
  })
})

test('shadowDOM templating', async (page, t) => {
  t.plan(1)
  await page.evaluate(async () => {
    document.body.innerHTML += `<test-seven test="5"></test-seven>`
    let el = document.querySelector('test-seven')
    await el.nextRender()
    let expected = `<style>test{font-size:5px;}</style>`
    t.same(clean(el.shadowRoot.innerHTML), expected)
  })
})

test('promises init/template/shadow', async (page, t) => {
  t.plan(4)
  await page.evaluate(async () => {
    document.body.innerHTML += `<test-eight></test-eight>`
    let el = document.querySelector('test-eight')
    await el.nextRender()
    let expected = `<style>test{font-size:3px;}</style>`
    t.same(clean(el.shadowRoot.innerHTML), expected)
    expected = '3'
    t.same(clean(el.querySelector('render').innerHTML), expected)
    document.querySelector('test-eight').test += 1
    await el.nextRender()
    expected = `<style>test{font-size:4px;}</style>`
    t.same(clean(el.shadowRoot.innerHTML), expected)
    expected = '4'
    t.same(clean(el.querySelector('render').innerHTML), expected)
  })
})

test('element in template', async (page, t) => {
  t.plan(3)
  await page.evaluate(async () => {
    document.body.innerHTML += `<test-nine></test-nine>`
    let el = await document.querySelector('test-nine').nextRender()
    let expected = '<div></div><test-container>default</test-container>'
    t.same(clean(el.innerHTML), expected)
    document.querySelector('test-nine').sub.textContent = 'pass'
    document.querySelector('test-container').innerHTML = 'pass'
    expected = '<div>pass</div><test-container>pass</test-container>'
    t.same(clean(el.innerHTML), expected)
    document.querySelector('test-nine').i += 1
    await document.querySelector('test-nine').nextRender()
    expected = '<div>pass</div><test-container>default</test-container>'
    t.same(clean(el.innerHTML), expected)
  })
})

test('waitFor subelement', async (page, t) => {
  t.plan(2)
  await page.evaluate(async () => {
    document.body.innerHTML += `<test-ten></test-ten>`
    let el = document.querySelector('test-ten')
    t.same(clean(el.innerHTML), '')
    el.sub = document.createElement('test-finished')
    await el.nextRender()
    let expected = '<renderslot="render"><test-finished></test-finished><t-1></t-1></render>'
    t.same(clean(el.innerHTML), expected)
  })
})

test('dynamically addSetting in init', async (page, t) => {
  t.plan(3)
  await page.evaluate(async () => {
    document.body.innerHTML += `<test-eleven></test-eleven>`
    let el = await document.querySelector('test-eleven').nextRender()
    let expected = '<button></button>'
    t.same(clean(el.innerHTML), expected)
    document.querySelector('test-eleven render button').click()
    expected = '<button>0</button>'
    document.querySelector('test-eleven').i += 1
    await document.querySelector('test-eleven').nextRender()
    expected = '<button>0</button>'
    t.same(clean(el.innerHTML), expected)
    document.querySelector('test-eleven render button').click()
    expected = '<button>1</button>'
    t.same(clean(el.innerHTML), expected)
  })
})

test('dynamic arrays from settings', async (page, t) => {
  t.plan(2)
  await page.evaluate(async () => {
    document.body.innerHTML += `<test-twelve></test-twelve>`
    let el = await document.querySelector('test-twelve').nextRender()
    let expected = '<top><pre></pre></top>'
    t.same(clean(el.innerHTML), expected)
    document.querySelector('test-twelve').arr.push('<next></next>')

    setTimeout(async () => {
      expected = '<top><pre></pre><next></next></top>'
      t.same(clean(document.querySelector('test-twelve render').innerHTML), expected)
      document.body.innerHTML += '<test-finished></test-finished>'
    }, 10)
  })
  await page.waitFor('test-finished')
})
