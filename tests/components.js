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

window.clean = str => str.replace(/\n/g, '').replace(/ /g, '')
