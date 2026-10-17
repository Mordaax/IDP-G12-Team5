import { forwardRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// The Events section (/events/*) is a separate Vue app (events.html), so links into it must be
// normal page loads. Use <AppLink> / useGo() instead of React Router's Link / navigate and the
// right thing happens for every address.
export const isVuePath = (to) => typeof to === 'string' && (to === '/events' || to.startsWith('/events/') || to.startsWith('/events?'))

const AppLink = forwardRef(function AppLink({ to, ...props }, ref) {
  if (isVuePath(to)) return <a ref={ref} href={to} {...props} />
  return <Link ref={ref} to={to} {...props} />
})
export default AppLink

export function useGo() {
  const navigate = useNavigate()
  return (to) => (isVuePath(to) ? window.location.assign(to) : navigate(to))
}
