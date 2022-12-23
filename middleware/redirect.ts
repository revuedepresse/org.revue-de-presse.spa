import { Middleware } from '@nuxt/types'
import Time from '../modules/time'

const RedirectMiddleware: Middleware = ({ route, redirect }) => {
  if (route.name !== 'review' && route.name !== 'list-review') {
    return redirect(`/${Time.today()}`)
  }
}

export default RedirectMiddleware
