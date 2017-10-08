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

See also [markdown-element](https://github.com/mikeal/markdown-element)
which is implemented with `rza`

### Kitchen Sink

Here's an example of every feature currently implemented.

```javascript
const gza = require('gza')

gza`
${element => { /* initialization function */
  element.i += 1
}}
${async element => { /* supports async functions */
  element.i += 1
}}
<test-kitchen ${{test: 'test', i: 0, size: 100}}> <!-- Default settings -->
  <div id="constructors">${settings => settings.i}</div> <!-- Templating -->
  <div id="propdefault">${async settings => settings.test}</div> <!-- Supports async -->
  <div id="inner">${(settings, innerHTML) => innerHTML}</div>
</test-kitchen>
<style>
::slotted(render) {
  font-size: ${settings => settings.size + '%'}; <!-- ShadowDOM Templating -->
}
</style>
<h3>Test</h3>
<slot name="render"></slot>
`
```

```html
<!-- Example w/ defaults -->
<kitchen-sink>TestContent</kitchen-sink>

<!-- Renders -->
<kitchen-sink>
  <h3>Test</h3>
  <render>
    <div id="constructors">2</div>
    <div id="propdefault">test</div>
    <div id="inner">TestContent</div>
  </render>
</kitchen-sink>

<!-- Example w/ property -->
<kitchen-sink size=200>TestContent</my-element>

<!-- Renders the same as before but with font-size increased to 200%-->
```

# Features

## Initialization Functions

Any function defined before your element definition is an initialization
function. It takes a single argument, an instance of the new element.

Only after all intialization functions have finished, including async
functions, will the render function be called.

Initialization functions are only ever called once per element instance.

```javascript
rza`
${async element => {
  let resp = await fetch('flowers.jpg')
  let blob = await resp.blob()
  element.src = URL.createObjectURL(blob)
}}
<my-image ${ {src: null} } >
  <img src="${settings => settings.src}"></img>
</my-image>
```

## Templatized Rendering

All content and functions defined inside your element definition are
used for templatized rendering.

The content and function results are used to display content in the
`<render>` element.

Every time an element attribute or element property changes that was
previously defined by the defaults, the entire element template will be run
again in order to re-render.

Every time the contents of the element changes it will also call the template
functions in order to re-render.

```javascript
rza`
<my-element ${one: 1, two: 2, three: 3}>
  <h1>${settings => settings.one}</h1>
  <h2>${settings => settings.two}</h2>
  <h3>${settings => settings.three}</h3>
</my-element>
`
```
```html
<!-- Example w/ defaults -->
<my-element></my-element>
<!-- Renders -->
<my-element>
  <render>
    <h1>1</h1>
    <h2>2</h2>
    <h3>3</h3>
  </render>
</my-element>

<!-- Property/Attribute changes will re-render -->
<script>
  let elem = document.querySelector('my-element')
  elem.one = 'one'
  elem.setAttribute('two', 'two')
  elem.setAttributeNS(null, 'three', 'three')
</script>
<!-- Re-Renders As -->
<my-element>
  <render>
    <h1>one</h1>
    <h2>two</h2>
    <h3>three</h3>
  </render>
</my-element>
```

## ShadowDOM

Any content defined **below** your element definition will be attached
to the shadowDOM. If you do not create a `slot` for `"render"` then the
rendered content will have nowhere to display.

You can also include template functions to dynamically change the shadowDOM
content and styling when properties and values change.

```javascript
const nowhitespace = str => str.replace(/ /g, '')

rza`
<my-shadow>
  ${(settings, innerHTML) => nowhitespace(innerHTML)}
</my-shadow>
<style>
h3 {
  font-size: 200%;
}
</style>
<h3>${(settings, innerHTML) => nowhitespace(innerHTML)}</h3>
<slot name="render"></slot>
`
```

```html
<!-- Example w/ defaults -->
<my-shadow>This is a test.</my-shadow>
<!-- Renders -->
<my-shadow>
  <h3>Thisisatest.</h3> <!-- This will display at 200% font size. -->
  <render>Thisisatest.</render>
</my-shadow>

```