import { useEffect, useState } from 'react'

function useOrientation() {
  const [isLandscape, setIsLandscape] = useState(
    window.innerWidth > window.innerHeight,
  )

  useEffect(() => {
    window.addEventListener('orientationchange', () => {
      const orientation = screen.orientation

      if (orientation.type.includes('portrait')) {
        setIsLandscape(false)
      } else if (orientation.type.includes('landscape')) {
        setIsLandscape(true)
      }
    })
  }, [])

  return isLandscape
}

export { useOrientation }
