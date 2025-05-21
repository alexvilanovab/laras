import { debounce } from '../utils/debounce'
import { useState, useEffect, useRef } from 'react'

export function useMaxSteps() {
  const [maxSteps, setMaxSteps] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const marginWidth = 32 + 16 // 32 for the x margin, 16 for the instrument id width
  const stepWidth = 16
  const gridSize = 4
  const debounceMs = 50

  useEffect(() => {
    if (!ref.current) return

    function calculateMaxSteps() {
      if (!ref.current) return

      const availableWidth = ref.current.clientWidth - marginWidth
      const maxSteps = Math.floor(availableWidth / stepWidth)

      const maxStepsGrid = gridSize > 1 ? Math.floor(maxSteps / gridSize) * gridSize : maxSteps

      setMaxSteps(maxStepsGrid)
    }

    calculateMaxSteps()

    const handleResize = debounce(calculateMaxSteps, debounceMs)
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [marginWidth, stepWidth, gridSize, debounceMs])

  return { ref, maxSteps }
}
