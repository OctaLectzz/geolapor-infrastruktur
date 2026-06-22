import React from 'react'
import { Route, Lightbulb, Waves, Construction, Footprints, Landmark, HelpCircle } from 'lucide-react'

interface CategoryIconProps {
  iconKey: string | null
  className?: string
}

export function CategoryIcon({ iconKey, className }: CategoryIconProps): React.ReactElement {
  const iconClass = className || 'size-6'

  switch (iconKey) {
    case 'road':
      return <Route className={iconClass} />
    case 'lamp':
      return <Lightbulb className={iconClass} />
    case 'waves':
      return <Waves className={iconClass} />
    case 'bridge':
      return <Construction className={iconClass} />
    case 'footprints':
      return <Footprints className={iconClass} />
    case 'landmark':
      return <Landmark className={iconClass} />
    default:
      return <HelpCircle className={iconClass} />
  }
}
