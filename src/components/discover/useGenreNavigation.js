import { useCallback, useRef, useState } from 'react'

export default function useGenreNavigation() {
  const cameraRef = useRef(null)
  const [focusedGenre, setFocusedGenre] = useState(null)
  const navigateGenre = useCallback(key => cameraRef.current?.focusGenre(key), [])
  return { cameraRef, focusedGenre, setFocusedGenre, navigateGenre }
}
