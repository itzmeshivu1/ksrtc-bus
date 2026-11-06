/**
 * Offline & Intermittent Map Tile Cache Service for KSRTC Smart Bus
 * Uses the Web CacheStorage API to store and serve map tiles for Karnataka transit routes.
 */

const CACHE_NAME = 'ksrtc-map-tiles-v1';

// Convert lat/lng to OpenStreetMap tile XYZ coordinates
export function latLngToTile(lat: number, lng: number, zoom: number): { x: number; y: number; z: number } {
  const x = Math.floor(((lng + 180) / 360) * Math.pow(2, zoom));
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * Math.pow(2, zoom)
  );
  return { x, y, z: zoom };
}

// Convert tile XYZ to lat/lng bounding box
export function tileToLatLng(x: number, y: number, zoom: number): { lat: number; lng: number } {
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, zoom);
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  const lng = (x / Math.pow(2, zoom)) * 360 - 180;
  return { lat, lng };
}

export function getTileUrl(x: number, y: number, z: number): string {
  // Reliable OpenStreetMap / CartoDB tiles
  const subdomains = ['a', 'b', 'c'];
  const s = subdomains[(x + y) % subdomains.length];
  return `https://${s}.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`;
}

/**
 * Fetch a tile, storing it in CacheStorage if online, or retrieving from CacheStorage if offline.
 */
export async function getCachedTileBlobUrl(x: number, y: number, z: number): Promise<string | null> {
  const url = getTileUrl(x, y, z);

  if ('caches' in window) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const match = await cache.match(url);
      if (match) {
        const blob = await match.blob();
        return URL.createObjectURL(blob);
      }

      // If online, fetch and save into cache
      if (navigator.onLine) {
        const response = await fetch(url, { mode: 'cors' });
        if (response.ok) {
          await cache.put(url, response.clone());
          const blob = await response.blob();
          return URL.createObjectURL(blob);
        }
      }
    } catch (err) {
      console.warn('Tile cache lookup failed for', url, err);
    }
  }

  // Fallback to direct URL if available
  return navigator.onLine ? url : null;
}

/**
 * Pre-cache map tiles for a route corridor between stops at zoom levels 8 to 11
 */
export async function preCacheRouteCorridor(
  coordinates: [number, number][],
  onProgress?: (cached: number, total: number) => void
): Promise<{ success: boolean; count: number }> {
  if (!('caches' in window)) {
    return { success: false, count: 0 };
  }

  const cache = await caches.open(CACHE_NAME);
  const tileSet = new Set<string>();

  // Gather tile keys for zoom levels 8 to 11
  const zoomLevels = [8, 9, 10, 11];

  coordinates.forEach(([lat, lng]) => {
    zoomLevels.forEach((zoom) => {
      const { x, y } = latLngToTile(lat, lng, zoom);
      // Also cache adjacent 1-tile margin for smooth scrolling
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const tileKey = `${zoom}/${x + dx}/${y + dy}`;
          tileSet.add(tileKey);
        }
      }
    });
  });

  const tileList = Array.from(tileSet);
  let cachedCount = 0;

  for (let i = 0; i < tileList.length; i++) {
    const [zStr, xStr, yStr] = tileList[i].split('/');
    const z = parseInt(zStr, 10);
    const x = parseInt(xStr, 10);
    const y = parseInt(yStr, 10);
    const url = getTileUrl(x, y, z);

    try {
      const existing = await cache.match(url);
      if (!existing) {
        const res = await fetch(url, { mode: 'cors' });
        if (res.ok) {
          await cache.put(url, res);
        }
      }
      cachedCount++;
      onProgress?.(cachedCount, tileList.length);
    } catch (e) {
      // Ignore individual tile fetch failure during intermittent connection
    }
  }

  return { success: true, count: cachedCount };
}

/**
 * Get total number of cached tiles in storage
 */
export async function getCachedTilesCount(): Promise<number> {
  if (!('caches' in window)) return 0;
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    return keys.length;
  } catch (e) {
    return 0;
  }
}

/**
 * Clear offline tile cache
 */
export async function clearTileCache(): Promise<boolean> {
  if (!('caches' in window)) return false;
  return caches.delete(CACHE_NAME);
}
