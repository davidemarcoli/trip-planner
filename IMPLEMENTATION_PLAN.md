# Trip Itinerary Planner - Implementation Plan

## Tech Stack
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Firebase (Firestore, Authentication, Storage for future photos)
- **Maps**: Leaflet with OpenStreetMap (free) or Mapbox (generous free tier)
- **Location Search**: Nominatim (OpenStreetMap's free geocoding API)
- **Additional Libraries**:
  - `react-beautiful-dnd` or `@dnd-kit` for drag-and-drop
  - `react-leaflet` for map integration
  - `date-fns` for date handling
  - `jspdf` or `react-to-print` for PDF export

---

## Database Schema (Firestore)

### Collections Structure

#### `users` collection
```typescript
{
  uid: string (document ID)
  email: string
  displayName: string
  photoURL?: string
  createdAt: timestamp
}
```

#### `trips` collection
```typescript
{
  id: string (document ID)
  title: string
  description?: string
  startDate: timestamp
  endDate: timestamp
  ownerId: string (user uid)
  createdAt: timestamp
  updatedAt: timestamp
  isPublic: boolean
  publicShareToken?: string (for public read-only access)
  
  // Permissions subcollection path: trips/{tripId}/permissions
  // Days subcollection path: trips/{tripId}/days
}
```

#### `trips/{tripId}/permissions` subcollection
```typescript
{
  userId: string (document ID)
  email: string
  role: 'view' | 'edit'
  grantedAt: timestamp
  grantedBy: string (user uid)
}
```

#### `trips/{tripId}/days` subcollection
```typescript
{
  id: string (document ID)
  date: timestamp
  order: number (0-indexed)
  
  // Items subcollection path: trips/{tripId}/days/{dayId}/items
}
```

#### `trips/{tripId}/days/{dayId}/items` subcollection
```typescript
{
  id: string (document ID)
  type: 'hotel' | 'flight' | 'restaurant' | 'activity' | 'transport' | 'custom'
  order: number (for ordering within day)
  time?: string (e.g., "14:30")
  
  // Common fields
  name: string
  address?: string
  latitude?: number
  longitude?: number
  notes?: string
  cost?: number
  currency?: string
  
  // Type-specific fields (stored as map)
  details: {
    // For flights
    flightNumber?: string
    airline?: string
    departureAirport?: string
    arrivalAirport?: string
    departureTime?: string
    arrivalTime?: string
    
    // For hotels
    checkInDate?: timestamp
    checkOutDate?: timestamp
    confirmationNumber?: string
    isPaid?: boolean
    bookingPlatform?: string (e.g., "Booking.com", "Airbnb")
    
    // For restaurants
    cuisine?: string
    reservationTime?: string
    reservationName?: string
    
    // For activities
    duration?: string
    ticketPrice?: number
    bookingRequired?: boolean
    
    // For transport
    transportType?: string (car, train, bus, etc.)
    departureLocation?: string
    arrivalLocation?: string
  }
  
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

## Application Structure

### File/Folder Organization

```
trip-planner/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── trips/
│   │   │   ├── page.tsx (list all trips)
│   │   │   ├── [tripId]/
│   │   │   │   ├── page.tsx (trip detail/itinerary view)
│   │   │   │   ├── edit/
│   │   │   │   │   └── page.tsx (edit trip metadata)
│   │   │   │   └── share/
│   │   │   │       └── page.tsx (sharing settings)
│   │   │   └── new/
│   │   │       └── page.tsx (create new trip)
│   │   └── layout.tsx (protected layout)
│   ├── public/
│   │   └── [shareToken]/
│   │       └── page.tsx (public read-only trip view)
│   ├── layout.tsx (root layout)
│   └── page.tsx (landing/redirect)
├── components/
│   ├── ui/ (shadcn components)
│   ├── auth/
│   │   ├── AuthProvider.tsx
│   │   └── GoogleSignInButton.tsx
│   ├── trip/
│   │   ├── TripCard.tsx
│   │   ├── TripList.tsx
│   │   ├── CreateTripDialog.tsx
│   │   └── ShareTripDialog.tsx
│   ├── itinerary/
│   │   ├── DayCard.tsx
│   │   ├── ItemCard.tsx
│   │   ├── AddItemDialog.tsx
│   │   ├── EditItemDialog.tsx
│   │   ├── LocationSearch.tsx
│   │   └── DraggableItem.tsx
│   ├── map/
│   │   ├── TripMap.tsx
│   │   ├── MapMarker.tsx
│   │   └── MapControls.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── lib/
│   ├── firebase/
│   │   ├── config.ts
│   │   ├── auth.ts
│   │   └── firestore.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTrips.ts
│   │   ├── useTripDetails.ts
│   │   └── usePermissions.ts
│   ├── services/
│   │   ├── tripService.ts
│   │   ├── itemService.ts
│   │   ├── locationService.ts (Nominatim API)
│   │   └── sharingService.ts
│   ├── types/
│   │   └── index.ts (TypeScript interfaces)
│   └── utils/
│       ├── dates.ts
│       ├── export.ts (PDF export logic)
│       └── navigation.ts (external navigation helper)
├── public/
│   └── icons/ (marker icons for different location types)
└── firebase.json (Firebase config)
```

---

## Implementation Phases

### Phase 1: Project Setup & Authentication
**Goal**: Set up the project foundation and user authentication

**Tasks**:
1. Initialize Next.js 14 project with TypeScript, Tailwind, and shadcn/ui
2. Set up Firebase project (create project in Firebase Console)
3. Configure Firebase Authentication (enable Google Sign-In)
4. Create Firestore database with security rules
5. Implement authentication flow:
   - Login page with Google Sign-In
   - Auth context provider
   - Protected routes middleware
   - User profile creation in Firestore on first login
6. Create basic layout (header with user menu, logout)

**Deliverables**:
- Users can sign in with Google
- Protected routes redirect to login
- Basic app shell with navigation

---

### Phase 2: Trip Management
**Goal**: Create, list, and manage trips

**Tasks**:
1. Create trip list page showing user's trips
2. Implement "Create Trip" dialog:
   - Title, description, start/end dates
   - Save to Firestore
3. Create trip card component showing:
   - Trip title, dates, destination count
   - Quick actions (view, edit, delete)
4. Implement trip detail page (empty for now)
5. Add edit trip functionality
6. Add delete trip with confirmation
7. Set up Firestore security rules for trips

**Deliverables**:
- Users can create, view, edit, and delete trips
- Trip list displays all user's trips
- Basic trip detail page exists

---

### Phase 3: Day & Item Management
**Goal**: Add days and items to trips

**Tasks**:
1. Auto-generate days based on trip start/end dates
2. Create day card component with date display
3. Implement "Add Item" dialog:
   - Type selector (hotel, flight, restaurant, activity, transport, custom)
   - Dynamic form fields based on type
   - Location search integration (Nominatim)
   - Time picker (optional)
   - Type-specific fields
4. Create item card component:
   - Display based on type (different layouts/icons)
   - Show key info (name, time, notes)
   - Quick actions (edit, delete, navigate)
5. Implement edit item functionality
6. Implement delete item with confirmation
7. Add budget tracking display (sum of costs per day/trip)

**Deliverables**:
- Users can add different types of items to days
- Items display with appropriate icons and information
- Location search works via Nominatim
- Budget totals calculated

---

### Phase 4: Drag & Drop Reordering
**Goal**: Allow reordering items within days

**Tasks**:
1. Install and configure `@dnd-kit` (recommended) or `react-beautiful-dnd`
2. Make item cards draggable
3. Implement drop zones within day cards
4. Update item order in Firestore on drop
5. Add visual feedback during drag (ghost item, drop zones)
6. Ensure mobile touch support works

**Deliverables**:
- Users can drag and drop items to reorder within a day
- Order persists to database
- Smooth animations and visual feedback

---

### Phase 5: Map Integration
**Goal**: Display all trip locations on an interactive map

**Tasks**:
1. Set up Leaflet with OpenStreetMap or Mapbox
2. Create map component that:
   - Shows all items with coordinates
   - Uses different marker colors/icons per type
   - Centers on trip locations
   - Supports zoom and pan
3. Implement marker click to show item details popup
4. Add "Show on Map" button on item cards
5. Sync map view with selected day (optional filter)
6. Add "Navigate" button that opens external navigation:
   - Google Maps on Android/web
   - Apple Maps on iOS
   - Use device detection

**Deliverables**:
- Interactive map showing all trip locations
- Different markers for different item types
- External navigation integration works

---

### Phase 6: Sharing & Permissions
**Goal**: Share trips with other users and create public links

**Tasks**:
1. Create sharing dialog:
   - Add user by email
   - Select permission level (view/edit)
   - List current collaborators
   - Remove collaborators
2. Implement permission checking in:
   - Frontend (hide edit buttons for viewers)
   - Firestore security rules
3. Add "Make Public" toggle:
   - Generate unique share token
   - Create public route that loads trip by token
   - Read-only view for public links
4. Display share status on trip card
5. Show "Shared with me" trips in trip list

**Deliverables**:
- Users can share trips with others by email
- View vs. Edit permissions work
- Public read-only links can be generated
- Firestore rules enforce permissions

---

### Phase 7: Export & Polish
**Goal**: Add export functionality and polish UI/UX

**Tasks**:
1. Implement PDF export:
   - Print-friendly itinerary view
   - Include all days and items
   - Show map snapshot (if possible)
   - Use `jspdf` or `react-to-print`
2. Add loading states throughout app
3. Add error handling and user-friendly error messages
4. Implement optimistic updates where appropriate
5. Add empty states (no trips, no items)
6. Ensure mobile responsiveness across all pages
7. Add keyboard shortcuts (optional, e.g., 'N' for new item)
8. Performance optimization:
   - Lazy load components
   - Optimize Firestore queries
   - Add pagination if needed

**Deliverables**:
- Users can export trip as PDF
- App is fully responsive on mobile
- Polished, professional UI with good UX
- Fast performance with loading states

---

## Key Technical Considerations

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(tripId) {
      return isSignedIn() && 
        get(/databases/$(database)/documents/trips/$(tripId)).data.ownerId == request.auth.uid;
    }
    
    function hasPermission(tripId, requiredRole) {
      return isSignedIn() && (
        isOwner(tripId) ||
        exists(/databases/$(database)/documents/trips/$(tripId)/permissions/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/trips/$(tripId)/permissions/$(request.auth.uid)).data.role == requiredRole
      );
    }
    
    function canView(tripId) {
      return hasPermission(tripId, 'view') || hasPermission(tripId, 'edit');
    }
    
    function canEdit(tripId) {
      return isOwner(tripId) || hasPermission(tripId, 'edit');
    }
    
    // Users
    match /users/{userId} {
      allow read: if isSignedIn();
      allow write: if isSignedIn() && request.auth.uid == userId;
    }
    
    // Trips
    match /trips/{tripId} {
      allow read: if isSignedIn() && (isOwner(tripId) || canView(tripId)) || 
                     resource.data.isPublic == true;
      allow create: if isSignedIn() && request.resource.data.ownerId == request.auth.uid;
      allow update: if canEdit(tripId);
      allow delete: if isOwner(tripId);
      
      // Permissions
      match /permissions/{userId} {
        allow read: if isSignedIn() && (isOwner(tripId) || canView(tripId));
        allow write: if isOwner(tripId);
      }
      
      // Days and Items
      match /days/{dayId} {
        allow read: if isSignedIn() && canView(tripId) || 
                       get(/databases/$(database)/documents/trips/$(tripId)).data.isPublic == true;
        allow write: if canEdit(tripId);
        
        match /items/{itemId} {
          allow read: if isSignedIn() && canView(tripId) || 
                         get(/databases/$(database)/documents/trips/$(tripId)).data.isPublic == true;
          allow write: if canEdit(tripId);
        }
      }
    }
  }
}
```

### Location Search (Nominatim)
- **API**: `https://nominatim.openstreetmap.org/search`
- **Rate limit**: 1 request per second (implement debouncing)
- **Usage policy**: Must include User-Agent header
- **Response**: Returns lat/lng, display name, address components

Example implementation:
```typescript
const searchLocation = async (query: string) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
    {
      headers: {
        'User-Agent': 'TripPlannerApp/1.0'
      }
    }
  );
  return response.json();
};
```

### Map Markers by Type
- **Hotel**: 🏨 Blue marker
- **Flight**: ✈️ Purple marker
- **Restaurant**: 🍽️ Red marker
- **Activity**: 🎯 Green marker
- **Transport**: 🚗 Orange marker
- **Custom**: 📍 Gray marker

Use Leaflet's `divIcon` with custom HTML/CSS or icon images.

### External Navigation
```typescript
const openNavigation = (lat: number, lng: number, name: string) => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const url = isIOS
    ? `maps://maps.apple.com/?q=${name}&ll=${lat},${lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  
  window.open(url, '_blank');
};
```

### Hotel Multi-Day Display
**Recommendation**: Display hotels on their check-in day only, but show check-out date in the hotel card details. This keeps the UI clean while providing the necessary information.

Alternative: Add a visual indicator (e.g., a connecting line or badge) showing "Staying here Days 3-5" on subsequent days.

---

## Environment Variables Needed

Create `.env.local`:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Optional: If using Mapbox instead of OpenStreetMap
NEXT_PUBLIC_MAPBOX_TOKEN=
```

---

## Testing Checklist

- [ ] User can sign in with Google
- [ ] User can create a trip
- [ ] User can edit trip details
- [ ] User can delete a trip
- [ ] Days auto-generate based on trip dates
- [ ] User can add items of all types to days
- [ ] Location search returns results
- [ ] User can edit item details
- [ ] User can delete items
- [ ] User can drag and drop items within a day
- [ ] Map displays all locations with correct markers
- [ ] Map markers are clickable and show details
- [ ] External navigation opens correct app
- [ ] User can share trip with another user (by email)
- [ ] Shared user receives correct permission level
- [ ] View-only users cannot edit
- [ ] Edit users can modify items
- [ ] User can generate public share link
- [ ] Public link loads trip in read-only mode
- [ ] Budget totals calculate correctly
- [ ] PDF export generates complete itinerary
- [ ] App is responsive on mobile devices
- [ ] All Firestore security rules work correctly

---

## Deployment

1. **Firebase Hosting** (recommended for Next.js static export) OR **Vercel** (recommended for full Next.js features)
2. Set environment variables in hosting platform
3. Configure Firebase Firestore indexes (will be prompted during development)
4. Set up custom domain (optional)

---

## Future Enhancements (Post-V1)

- Photo uploads for items
- Real-time collaboration
- Email notifications for trip shares
- Weather integration
- Duplicate trip feature
- Trip templates
- Calendar integration (export to Google Calendar)
- Offline support (PWA)
- Multi-language support
- Dark mode
- Trip statistics (total cost, distance traveled, etc.)