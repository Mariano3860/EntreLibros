export type MapIconName = 'search' | 'book'

// These paths are application constants, never HTML obtained from map data.
export const MAP_ICON_PATHS: Record<MapIconName, string> = {
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14m5 12 5 5M8 11h6m-3-3v6',
  book: 'M3 4h5l4 2 4-2h5v15h-5l-4 2-4-2H3V4m9 2v15',
}
