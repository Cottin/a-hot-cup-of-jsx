import {createRenderer} from 'fela'
import {render} from 'fela-dom'
import webPreset from 'fela-preset-web'
import {createContext, useContext} from 'solid-js'

FelaContext = createContext()

felaRenderer = createRenderer {plugins: [...webPreset]}

parseShortstyle = (s) ->
  padding: 10

useFela = () ->
  renderer = useContext FelaContext
  console.log 'renderer', renderer
  return (s) ->
    return renderer.renderRule (-> parseShortstyle s), {}

render(felaRenderer)

FelaProvider = (props) ->
  <FelaContext.Provider value={felaRenderer}>
    {props.children}
  </FelaContext.Provider>


export {FelaProvider, useFela}
