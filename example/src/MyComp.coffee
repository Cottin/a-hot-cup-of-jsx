import {useFela} from './felaSetup'

rule = (props) ->
  fontSize: 24
  color: props.color 

MyComp = () ->
  renderer = useFela()
  console.log 'renderer', renderer
  className = renderer.renderRule rule, {color: 'red'}
  console.log 'className', className
  <div class={className}>te5</div>



export default MyComp
