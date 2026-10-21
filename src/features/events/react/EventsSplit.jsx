import { Navigate, useLocation } from 'react-router-dom'

// Keep previously shared Design B links working after the experiment moved to rows.
export default function EventsSplit() {
  const { search, hash } = useLocation()
  return <Navigate to={{ pathname: '/events/listB', search, hash }} replace />
}
