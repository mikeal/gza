/* globals clean, same */
const puppeteer = require('puppeteer')
const { test } = require('tap')

const path = require('path')
const bl = require('bl')
const browserify = require('browserify')
const istanbul = require('browserify-istanbul')

const bundle = new Promise((resolve, reject) => {
  var b = browserify()
  b.transform(istanbul)
  b.add(path.join(__dirname, 'components.js'))
  b.bundle().pipe(bl((err, buff) => {
    if (err) return reject(err)
    resolve(buff)
  }))
})

const index = async inner => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
    </head>
    <body>
      <script>${await bundle}</script>
      ${await inner}
    </body>
  </html>
  `
}

let browser

test('setup', async t => {
  browser = await puppeteer.launch()
  t.end()
})

const getPage = async (t, inner) => {
  const page = await browser.newPage()
  await page.setContent(await index(inner))
  page.browser = browser
  let same = (x, y) => t.same(x, y)
  await page.exposeFunction('same', (x, y) => {
    same(x, y)
  })
  return page
}

test('basic', async t => {
  t.plan(1)
  let page = await getPage(t, `<test-one></test-one>`)
  await page.waitFor('test-one render')
  await page.evaluate(async () => {
    same(clean(document.querySelector('test-one render').textContent), 'Test')
  })
  await page.close()
})

test('default settings', async t => {
  t.plan(1)
  let page = await getPage(t, `<test-two></test-two>`)
  await page.waitFor('test-two render')
  await page.evaluate(async () => {
    same(clean(document.querySelector('test-two render').textContent), '2')
  })
  await page.close()
})

test('set shadowDOM', async t => {
  t.plan(1)
  let page = await getPage(t, `<test-three></test-three>`)
  await page.waitFor('test-three render')
  await page.evaluate(async () => {
    let expected = `<style>test{font-size:50px;}</style>`
    same(clean(document.querySelector('test-three').shadowRoot.innerHTML), expected)
  })
  await page.close()
})

test('template values', async t => {
  t.plan(1)
  let page = await getPage(t, `<test-four></test-four>`)
  await page.waitFor('test-four render')
  await page.evaluate(async () => {
    let expected = `test<div>2</div>`
    same(clean(document.querySelector('test-four render').innerHTML), expected)
  })
  await page.close()
})

test('initialization functions', async t => {
  t.plan(1)
  let page = await getPage(t, `<test-five></test-five>`)
  await page.waitFor('test-five render')
  await page.evaluate(async () => {
    same(clean(document.querySelector('test-five render').textContent), '4')
  })
  await page.close()
})

test('elment attributes for settings', async t => {
  t.plan(1)
  let page = await getPage(t, `<test-six test="5"></test-six>`)
  await page.waitFor('test-six render')
  await page.evaluate(async () => {
    same(clean(document.querySelector('test-six render').textContent), '5')
  })
  await page.close()
})

test('shadowDOM templating', async t => {
  t.plan(1)
  let page = await getPage(t, `<test-seven test="5"></test-seven>`)
  await page.waitFor('test-seven render')
  await page.evaluate(async () => {
    let expected = `<style>test{font-size:5px;}</style>`
    same(clean(document.querySelector('test-seven').shadowRoot.innerHTML), expected)
  })
  await page.close()
})

test('teardown', async t => {
  await browser.close()
  t.end()
})
