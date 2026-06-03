# Location Filter Toggle Feature

## Overview
Users can now see ALL products by default with nearby products featured first (sorted by distance), and optionally toggle to show only nearby products within their selected radius.

## What Changed

### Backend Changes

#### 1. **GeoService** (`server/src/services/geoService.ts`)
- Modified `getNearbyProducts()` to accept `filterByLocation` parameter
- When `filterByLocation = true` (default): Only shows products within the radius
- When `filterByLocation = false`: Shows ALL products, sorted by distance
- Automatically sorts by distance first when showing all products
- Other sort options (rating, price, new) apply after distance sorting

#### 2. **GeoController** (`server/src/controllers/geoController.ts`)
- Updated `getNearbyProducts` endpoint to accept `filterByLocation` query parameter
- Defaults to `true` (show nearby only)
- Passes parameter to GeoService

### Frontend Changes

#### 1. **useNearbyProducts Hook** (`client/src/hooks/useNearbyProducts.ts`)
- Added `filterByLocation` parameter to `FetchFilters` interface
- Passes `filterByLocation` in query parameters to API

#### 2. **Home Page** (`client/src/pages/Home.tsx`)
- Added `filterByLocation` state (default: true)
- Added toggle UI checkbox next to Radius Slider
  - Shows current state: "Filtering to show only products within your radius" or "Showing all products, sorted by distance"
- Updated all `fetchNearbyProducts` calls to include `filterByLocation` parameter
- Added `filterByLocation` to useEffect dependencies so products re-fetch when toggle changes

## UI/UX

### Toggle Appearance
```
☑ Show nearby products only
  Filtering to show only products within your radius
```

When unchecked:
```
☐ Show nearby products only
  Showing all products, sorted by distance
```

### Behavior

**When Toggle is ON (checked):**
- Radius: 5km, Distance Filter: ON
- Only products within 5km are shown
- Same as original behavior
- Results sorted by distance

**When Toggle is OFF (unchecked):**
- Radius: 5km (doesn't matter for filtering)
- ALL products are shown
- Products are automatically sorted by distance (nearest first)
- Then by selected sort option (rating, price, new)
- Distance information still displays on each product

## API Usage

### Query Parameter

```
GET /api/v1/geo/nearby-products?lat=11.25&lng=75.78&radius=5&filterByLocation=false
```

- `filterByLocation=true` (default) - Only nearby products
- `filterByLocation=false` - All products with distance sorting

## Flow Diagram

```
User Opens App
    ↓
[DEFAULT] filterByLocation = true
    ↓
Shows Nearby Products Only (within radius)
    ↓
User Unchecks Toggle
    ↓
filterByLocation = false
    ↓
Shows ALL Products (sorted by distance)
    ↓
User Checks Toggle
    ↓
filterByLocation = true
    ↓
Back to Nearby Only
```

## Implementation Details

### Distance Sorting Priority (when filterByLocation = false)
1. **Primary Sort**: Distance (ascending - closest first)
2. **Secondary Sort**: Selected sort option
   - Rating: By rating (highest first)
   - Price: By price (lowest first)
   - New: By creation date (newest first)

### Performance
- Cache is only used when `filterByLocation = true` (nearby only mode)
- All products mode doesn't cache to ensure fresh results
- Still uses MongoDB geospatial index for fast distance calculation

## Testing Checklist

- [ ] Verify toggle appears next to radius slider
- [ ] Test toggle ON: Shows only nearby products within radius
- [ ] Test toggle OFF: Shows all products sorted by distance
- [ ] Verify distance displays correctly on all products when showing all
- [ ] Test searching with toggle ON and OFF
- [ ] Test category filtering with both toggle states
- [ ] Test sort options with toggle OFF (distance priority + secondary sort)
- [ ] Verify API accepts filterByLocation parameter
- [ ] Test toggling multiple times rapidly
- [ ] Verify error retry button works with current toggle state

## Files Modified

1. `server/src/services/geoService.ts` - Added filterByLocation logic
2. `server/src/controllers/geoController.ts` - Added parameter handling
3. `client/src/hooks/useNearbyProducts.ts` - Added parameter to hook
4. `client/src/pages/Home.tsx` - Added UI and state management

## Notes

- The toggle is only visible when user has location enabled (`coords` exists)
- Radius slider is still visible and functional for both modes
- When showing all products, increasing/decreasing radius doesn't affect filtering but still shows in the UI as context
- Default behavior (toggle checked) matches the previous app behavior
