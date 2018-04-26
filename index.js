/* globals HTMLElement */
const RZA = require('rza')
const raekwon = require('raekwon')
const parse = require('./lib/parser')

const render = async (el, arr, settings, innerHTML) => {
  let tmp = arr.map(t => {
    if (typeof t === 'string') return t
    else if (typeof t === 'function') return t(settings, innerHTML)
    /* For some reason istanbul can't just ignore the else statement here. */
    else /* istanbul ignore next */ if (t instanceof HTMLElement) {
      return t
    /* Can't test this effectively since renders aren't sync */
    /* istanbul ignore next */
    } else throw new Error(`Unknown type in template: ${t}`)
  })
  let results = await Promise.all(tmp)
  return raekwon(el, results)
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
        for (const c of parsed.constructors) {
          await c(this)
        }
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
      if (parsed.shadow.filter(s => typeof s === 'function').length) {
        await render(this.shadowRoot, parsed.shadow, settings, innerHTML)
      }
      await render(_render, parsed.template, settings, innerHTML)

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
/* istanbul ignore if */
if (process.distjs) {
  /* istanbul ignore next */
  window.gza = gza
}
