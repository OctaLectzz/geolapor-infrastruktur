'use client'

import { useEffect, useRef } from 'react'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import type { PublicReportListItemDto } from '@/types/report'

// Indonesia center coordinates
const DEFAULT_CENTER: L.LatLngExpression = [-2.5, 118.0]
const DEFAULT_ZOOM = 5

const STATUS_COLORS: Record<string, string> = {
  VERIFIED: '#3b82f6',
  ASSIGNED: '#8b5cf6',
  IN_PROGRESS: '#f59e0b',
  NEED_REVIEW: '#06b6d4',
  COMPLETED: '#22c55e'
}

function createMarkerIcon(status: string): L.DivIcon {
  const color = STATUS_COLORS[status] ?? '#6b7280'

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 28px;
      height: 28px;
      border-radius: 50% 50% 50% 0;
      background: ${color};
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "><div style="
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: white;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    "></div></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  })
}

interface LeafletMapProps {
  reports: PublicReportListItemDto[]
  selectedReport: PublicReportListItemDto | null
  onMarkerClick: (report: PublicReportListItemDto) => void
}

export function LeafletMap({ reports, selectedReport, onMarkerClick }: LeafletMapProps): React.ReactElement {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.LayerGroup | null>(null)

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return
    }

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      attributionControl: true
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map)

    const layerGroup = L.layerGroup().addTo(map)

    mapRef.current = map
    markersRef.current = layerGroup

    return (): void => {
      map.remove()
      mapRef.current = null
      markersRef.current = null
    }
  }, [])

  // Update markers when reports change
  useEffect(() => {
    const layerGroup = markersRef.current
    if (!layerGroup) {
      return
    }

    layerGroup.clearLayers()

    for (const report of reports) {
      const lat = parseFloat(report.latitude)
      const lng = parseFloat(report.longitude)

      if (isNaN(lat) || isNaN(lng)) {
        continue
      }

      const icon = createMarkerIcon(report.status)
      const marker = L.marker([lat, lng], { icon })

      marker.on('click', () => {
        onMarkerClick(report)
      })

      marker.addTo(layerGroup)
    }
  }, [reports, onMarkerClick])

  // Pan to selected report
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedReport) {
      return
    }

    const lat = parseFloat(selectedReport.latitude)
    const lng = parseFloat(selectedReport.longitude)

    if (!isNaN(lat) && !isNaN(lng)) {
      map.setView([lat, lng], Math.max(map.getZoom(), 14), { animate: true })
    }
  }, [selectedReport])

  return <div ref={mapContainerRef} className="size-full" />
}
