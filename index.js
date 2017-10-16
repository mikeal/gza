/* globals HTMLElement */
const RZA = require('rza')
const raekwon = require('raekwon')
const parse = require('./lib/parser')

const render = async (el, arr, settings, innerHTML) => {
  let tmp = arr.map(t => {
    if (typeof t === 'string') return t
    else if (typeof t === 'function') return t(settings, innerHTML)
    else if (t instanceof HTMLElement) return t
    else throw new Error(`Unknown type in template: ${t}`)
  })
  let results = await Promise.all(tmp)
  raekwon(el, results)
}

const nowhitespace = str => {
  return str.replace(/\n/g, '').replace(/ /g, '')
}

const gza = (strings, ...keys) => {
  let parsed = parse(strings, keys)

  class CustomElement extends RZA {
    async render (settings, innerHTML) {
      if (!this._constructed) {
        this._constructed = true
        await Promise.all(parsed.constructors.map(c => c(this)))
        /* We have don't want constructors to trigger another render.
           Instead, we can just reset the re-render and settings state.
         */
        this._rerender = false
        /* Since we are suppressing re-render we need to re-pull settings
           because they can be altered by the init function.
        */
        settings = Object.assign({}, this._settings)
      }
      let _render = this.renderElement
      await render(_render, parsed.template, settings, innerHTML)
      if (parsed.shadow.filter(s => typeof s === 'function').length) {
        await render(this.shadowRoot, parsed.shadow, settings, innerHTML)
      }
      return _render
    }

    get defaults () {
      return parsed.defaults
    }
    get shadow () {
      if (parsed.shadow.filter(s => typeof s === 'function').length) {
        /* placeholder shadow until the real one shows up */
        return '<style>:host {margin: 0 0 0 0; padding: 0 0 0 0;}</style>'
      } else if (nowhitespace(parsed.shadow.join('')).length > 1) {
        return parsed.shadow.join('')
      } else {
        return super.shadow
      }
    }
  }

  let className = parsed.tagName.split('-').map(
    s => s[0].toUpperCase() + s.slice(1)
  ).join('')

  Object.defineProperty(CustomElement, 'name', {value: className})

  window.customElements.define(parsed.tagName, CustomElement)

  return CustomElement
}

module.exports = gza

/* Expose global in standalone bundle. */
if (process.distjs) {
  window.gza = gza
}
