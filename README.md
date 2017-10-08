# gza - Declarative custom HTML elements

```javascript
const gza = require('gza')

gza`
<my-element ${ {test: 'pass'} }>
  ${ settings => settings.test }
</my-element>
`
```
```html
<!-- Example w/ defaults -->
<my-element></my-element>

<!-- Renders -->
<my-element>
  <render>
    pass
  </render>
</my-element>

<!-- Example w/ property -->
<my-element test="test-prop"></my-element>

<!-- Renders -->
<my-element>
  <render>
    test-prop
  </render>
</my-element>
```

Here's an example of every feature currently implemented.

```javascript
const gza = require('gza')

gza`
${element => {
  element.i += 1
}}
${async element => {
  element.i += 1
}}
<test-kitchen ${{test: 'proptest', i: 0, size: 100}}>
  <div id="constructors">${settings => settings.i}</div>
  <div id="propdefault">${async settings => settings.test}</div>
</test-kitchen>
<style>
::slotted(render) {
  font-size: ${settings => settings.size + '%'};
}
</style>
<h3>Test</h3>
<slot name="render"></slot>
`
```

```html
<!-- Example w/ defaults -->
<kitchen-sink></kitchen-sink>

<!-- Renders -->
<kitchen-sink>
  <h3>Test</h3>
  <render>
    <div id="constructors">2</div>
    <div id="propdefault">proptest</div>
  </render>
</kitchen-sink>

<!-- Example w/ property -->
<kitchen-sink size=200></my-element>

<!-- Renders the same as before but with font-size increased to 200%-->
```