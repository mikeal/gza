let gza = require('./')

gza`
${element => {
  element.i += 1
}}
${async element => {
  element.i += 1
}}
<kitchen-sink ${{test: 'proptest', i: 0, size: 100}}>
  <div id="constructors">${settings => settings.i}
  <div id="propdefault">${settings => settings.test}</div>
</kitchen-sink>
<style>
::slotted(render) {
  font-size: ${settings => settings.size + '%'};
}
</style>
<h3>Test</h3>
<slot name="render"></slot>
`
