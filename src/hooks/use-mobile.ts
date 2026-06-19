import * as React from 'react'

const MOBILE_BREAKPOINT = 768

function getIsMobile(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return window.innerWidth < MOBILE_BREAKPOINT
}

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean>(getIsMobile)

  React.useEffect(() => {
    const mediaQueryList = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const handleChange = (): void => {
      setIsMobile(mediaQueryList.matches)
    }

    mediaQueryList.addEventListener('change', handleChange)

    return () => mediaQueryList.removeEventListener('change', handleChange)
  }, [])

  return isMobile
}
