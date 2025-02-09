
import React from "react"

export function useIsInIframe() {
  const [isInIframe, setIsInIframe] = React.useState(false)

  React.useEffect(() => {
    //setIsInIframe(true)
    setIsInIframe(window.self !== window.top)
  }, [])

  return isInIframe
}