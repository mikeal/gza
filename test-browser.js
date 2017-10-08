let gza = require('./')

let cls = gza`
${() => {}}
${() => {}}
<test-one ${{test: 2}}>
  ${() => {}}
  <div>${settings => {
    console.log('settings')
    return settings.test
  }
  }</div>
</test-one>
`

