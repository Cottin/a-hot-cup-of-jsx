
import CoffeeScript from 'coffeescript'

export const coffeePlugin = () => {
  return {
    name: 'coffee',
    enforce: 'pre',
    transform: (src, id) => {
      if (/\.coffee$/.test(id)) {
        const {js, sourceMap} = CoffeeScript.compile(src, {sourceMap: true})
        // console.log('js', js)

        return {code: js, map: sourceMap}
      }
    }
  }
}

