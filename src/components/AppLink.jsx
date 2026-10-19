import { forwardRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const AppLink = forwardRef(function AppLink({ to, ...props }, ref) {
  return <Link ref={ref} to={to} {...props} />
})
export default AppLink

export function useGo() {
  const navigate = useNavigate()
  return (to) => navigate(to)
}
