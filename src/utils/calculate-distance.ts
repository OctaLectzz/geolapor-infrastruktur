export interface CoordinatePoint {
  latitude: number
  longitude: number
}

const EARTH_RADIUS_METERS = 6_371_000

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

function isValidLatitude(latitude: number): boolean {
  return Number.isFinite(latitude) && latitude >= -90 && latitude <= 90
}

function isValidLongitude(longitude: number): boolean {
  return Number.isFinite(longitude) && longitude >= -180 && longitude <= 180
}

function assertValidCoordinatePoint(point: CoordinatePoint): void {
  if (!isValidLatitude(point.latitude)) {
    throw new Error('Invalid latitude')
  }

  if (!isValidLongitude(point.longitude)) {
    throw new Error('Invalid longitude')
  }
}

export function calculateDistanceInMeters(origin: CoordinatePoint, destination: CoordinatePoint): number {
  assertValidCoordinatePoint(origin)
  assertValidCoordinatePoint(destination)

  const originLatitude = degreesToRadians(origin.latitude)
  const destinationLatitude = degreesToRadians(destination.latitude)
  const latitudeDelta = degreesToRadians(destination.latitude - origin.latitude)
  const longitudeDelta = degreesToRadians(destination.longitude - origin.longitude)

  const haversineValue =
    Math.sin(latitudeDelta / 2) ** 2 + Math.cos(originLatitude) * Math.cos(destinationLatitude) * Math.sin(longitudeDelta / 2) ** 2

  const angularDistance = 2 * Math.atan2(Math.sqrt(haversineValue), Math.sqrt(1 - haversineValue))

  return EARTH_RADIUS_METERS * angularDistance
}

export function calculateDistanceInKilometers(origin: CoordinatePoint, destination: CoordinatePoint): number {
  return calculateDistanceInMeters(origin, destination) / 1000
}
