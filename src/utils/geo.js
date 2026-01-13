export function haversineDistance(lat1, lng1, lat2, lng2) {
  if (
    typeof lat1 !== 'number' ||
    typeof lng1 !== 'number' ||
    typeof lat2 !== 'number' ||
    typeof lng2 !== 'number'
  ) {
    return null
  }

  if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) {
    return null
  }

  const R = 6371

  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  return haversineDistance(lat1, lng1, lat2, lng2)
}

export function pointToSegmentDistanceKm(point, segStart, segEnd) {
  const [pointLat, pointLng] = [point.lat, point.lng]
  const [segStartLat, segStartLng] = [segStart[1], segStart[0]]
  const [segEndLat, segEndLng] = [segEnd[1], segEnd[0]]

  const distToStart = haversineDistanceKm(pointLat, pointLng, segStartLat, segStartLng)
  const distToEnd = haversineDistanceKm(pointLat, pointLng, segEndLat, segEndLng)
  const distSegment = haversineDistanceKm(segStartLat, segStartLng, segEndLat, segEndLng)

  if (distSegment === null || distSegment === 0) {
    return distToStart
  }

  const a = distToStart
  const b = distToEnd
  const c = distSegment

  if (a * a >= b * b + c * c) {
    return b
  }
  if (b * b >= a * a + c * c) {
    return a
  }

  const s = (a + b + c) / 2
  const area = Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - c)))
  const height = (2 * area) / c

  return height
}

export function distancePointToPolylineKm(point, polylineCoords) {
  if (!polylineCoords || polylineCoords.length < 2) {
    return null
  }

  let minDistance = Infinity

  for (let i = 0; i < polylineCoords.length - 1; i++) {
    const segStart = polylineCoords[i]
    const segEnd = polylineCoords[i + 1]

    const distance = pointToSegmentDistanceKm(point, segStart, segEnd)

    if (distance !== null && distance < minDistance) {
      minDistance = distance
    }
  }

  return minDistance === Infinity ? null : minDistance
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180)
}
