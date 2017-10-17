let gza = require('../')

gza`
<test-one>
  Test
</test-one>
`

gza`<test-two ${{test: 2}}>
  ${settings => settings.test}
</test-two>`

gza`
<test-three>
</test-three>
<style>
test {
  font-size: 50px;
}
</style>
`

gza`
<test-four ${{test: 2}}>
  ${() => 'test'}
  <div>${settings => settings.test}</div>
</test-four>
`

gza`
${elem => {
  elem.test += 1
}}
${async elem => {
  elem.test += 1
}}
<test-five ${{test: 2}}>
  ${settings => settings.test}
</test-five>
`

gza`
<test-six ${{test: 2}}>
  ${settings => settings.test}
</test-six>
`

gza`
<test-seven ${{test: 2}}>
</test-seven>
<style>
  test {
    font-size: ${settings => settings.test}px;
  }
</style>
`

gza`
${async element => {
  element.test += 1
}}
<test-eight ${{test: 2}}>
  ${async settings => settings.test}
</test-eight>
<style>
  test {
    font-size: ${async settings => settings.test}px;
  }
</style>
`

gza`
<test-nine ${{sub: () => document.createElement('div'), i: 0}}>
 ${settings => settings.sub}
 <test-container>default</test-container>
</test-nine>
`

gza`
<test-ten>
${settings => settings.waitFor('sub')}
${document.createElement('t-1')}
</test-ten>
`

gza`
${element => {
  let btn = document.createElement('button')
  btn.onclick = () => {
    btn.textContent = element.i
  }
  element.addSetting('button', btn)
}}
<test-eleven ${{i: 0}}>
${settings => settings.button}
</test-eleven>
`

gza`
${element => {
  element.addSetting('arr', ['<pre></pre>'])
}}
<test-twelve>
  <top>
  ${settings => settings.arr}
  </top>
</test-twelve>
`

window.clean = str => str.replace(/\n/g, '').replace(/ /g, '')
