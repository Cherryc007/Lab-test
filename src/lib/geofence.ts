import { GpsValidationResult } from '../types';

/**
 * Calculates the Haversine distance in meters between two coordinates.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
      
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}

/**
 * Validates if a coordinate is within a site's geofence radius.
 */
export function validateGeofence(
  guardLat: number | null | undefined,
  guardLon: number | null | undefined,
  siteLat: number,
  siteLon: number,
  radiusMeters: number
): GpsValidationResult {
  if (guardLat === undefined || guardLat === null || guardLon === undefined || guardLon === null) {
    return GpsValidationResult.Unavailable;
  }
  
  const distance = haversineDistance(guardLat, guardLon, siteLat, siteLon);
  return distance <= radiusMeters
    ? GpsValidationResult.WithinGeofence
    : GpsValidationResult.OutOfGeofence;
}
