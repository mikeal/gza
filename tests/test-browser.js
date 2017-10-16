/* globals clean, same */
const puppeteer = require('puppeteer')
const { test } = require('tap')

const path = require('path')
const bl = require('bl')
const browserify = require('browserify')

const bundle = new Promise((resolve, reject) => {
  var b = browserify()
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
  page.on('console', msg => console.log(msg.text))
  page.on('error', err => { throw err })
  page.on('pageerror', msg => { throw new Error(`Page Error: ${msg}`) })
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

test('promises init/template/shadow', async t => {
  t.plan(4)
  let page = await getPage(t, `<test-eight></test-eight>`)
  await page.waitFor('test-eight render')
  await page.evaluate(async () => {
    let expected = `<style>test{font-size:3px;}</style>`
    same(clean(document.querySelector('test-eight').shadowRoot.innerHTML), expected)
    expected = '3'
    same(clean(document.querySelector('test-eight render').innerHTML), expected)
    document.querySelector('test-eight').test += 1
    setTimeout(() => {
      expected = `<style>test{font-size:4px;}</style>`
      same(clean(document.querySelector('test-eight').shadowRoot.innerHTML), expected)
      expected = '4'
      same(clean(document.querySelector('test-eight render').innerHTML), expected)
      document.body.innerHTML += '<test-finished></test-finished>'
    }, 10)
  })
  await page.waitFor('test-finished')
  await page.close()
})

test('element in template', async t => {
  t.plan(3)
  let page = await getPage(t, `<test-nine></test-nine>`)
  await page.waitFor('test-nine render')
  await page.evaluate(async () => {
    let expected = '<div></div><test-container>default</test-container>'
    same(clean(document.querySelector('test-nine render').innerHTML), expected)
    document.querySelector('test-nine').sub.textContent = 'pass'
    document.querySelector('test-container').innerHTML = 'pass'
    expected = '<div>pass</div><test-container>pass</test-container>'
    same(clean(document.querySelector('test-nine render').innerHTML), expected)
    document.querySelector('test-nine').i += 1
    setTimeout(() => {
      expected = '<div>pass</div><test-container>default</test-container>'
      same(clean(document.querySelector('test-nine render').innerHTML), expected)
      document.body.innerHTML += '<test-finished></test-finished>'
    }, 10)
  })
  await page.waitFor('test-finished')
})

test('waitFor subelement', async t => {
  t.plan(2)
  let page = await getPage(t, `<test-ten></test-ten>`)
  await page.waitFor('test-ten render')
  await page.evaluate(async () => {
    setTimeout(() => {
      let expected = '<renderslot="render"></render>'
      same(clean(document.querySelector('test-ten').innerHTML), expected)
      document.querySelector('test-ten').sub = document.createElement('test-finished')
    }, 10)
  })
  await page.waitFor('test-finished')
  await page.evaluate(async () => {
    let expected = '<renderslot="render"><test-finished></test-finished><t-1></t-1></render>'
    same(clean(document.querySelector('test-ten').innerHTML), expected)
  })
  await page.close()
})

test('dyanmically addSetting in init', async t => {
  t.plan(3)
  let page = await getPage(t, `<test-eleven></test-eleven>`)
  await page.waitFor('test-eleven render')
  await page.evaluate(async () => {
    let expected = '<button></button>'
    same(clean(document.querySelector('test-eleven render').innerHTML), expected)
    document.querySelector('test-eleven render button').click()
    expected = '<button>0</button>'
    document.querySelector('test-eleven').i += 1
    setTimeout(() => {
      expected = '<button>0</button>'
      same(clean(document.querySelector('test-eleven render').innerHTML), expected)
      document.querySelector('test-eleven render button').click()
      expected = '<button>1</button>'
      same(clean(document.querySelector('test-eleven render').innerHTML), expected)
      document.body.innerHTML += '<test-finished></test-finished>'
    }, 10)
  })
  await page.waitFor('test-finished')
  await page.close()
})

test('dynamic arrays from settings', async t => {
  t.plan(2)
  let page = await getPage(t, `<test-twelve></test-twelve>`)
  await page.waitFor('test-twelve render')
  await page.evaluate(async () => {
    let expected = '<top><pre></pre></top>'
    same(clean(document.querySelector('test-twelve render').innerHTML), expected)
    document.querySelector('test-twelve').arr.push('<next></next>')
    setTimeout(() => {
      expected = '<top><pre></pre><next></next></top>'
      same(clean(document.querySelector('test-twelve render').innerHTML), expected)
      document.body.innerHTML += '<test-finished></test-finished>'
    }, 10)
  })
  await page.waitFor('test-finished')
  await page.close()
})

test('teardown', async t => {
  await browser.close()
  t.end()
})
