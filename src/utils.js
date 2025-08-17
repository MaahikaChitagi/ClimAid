// src/utils.js
export function geodesicDistance(from, to) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 3958.8; // Radius of Earth in miles

  const dLat = toRad(to.lat - from.lat);
  const dLon = toRad(to.lng - from.lng);

  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // Return rounded distance in miles
}
