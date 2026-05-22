# mamdoo-app — Ride Booking Flow

## Client (passenger) side

### Steps

| Step | State `step` value | Screen | Description |
|---|---|---|---|
| 1 | `1` | HomeScene | Map open, pickup auto-detected from GPS |
| 2 | `2` | SearchRide | User enters drop-off, selects ride type + payment |
| 3 | `3` | RideRequest | Waiting for driver — shows nearby driver count |
| 4 | `4` | Ride | In-progress — live driver location, polyline route, ETA |
| — | — | Review | Post-ride rating and comment |

### State shape during booking (`store.ride`)

```js
{
  step: 1,
  newRide: {
    pickUp: { text, location: { lat, lng }, placeId },
    dropOff: { text, location: { lat, lng }, placeId },
    price: number,
    cabTypeId: string
  },
  newRideDetails: {
    polyline: string,       // encoded polyline for route display
    distance: string,
    duration: string
  },
  requestId: string,
  onGoingRide: boolean,
  driver: {
    name, phone, rating,
    location: { latitude, longitude }
  },
  driverCurrentLocation: { latitude, longitude },
  nearByDrivers: number
}
```

### Socket.io events received (client)

| Event | Triggered by | Action |
|---|---|---|
| `FOUND_DRIVER` | Driver accepts | Transition to step 4, store driver info |
| `DRIVER_ARRIVED` | Driver marks arrival | Show "driver is here" notice |
| `END_RIDE` | Provider ends ride | Navigate to Review screen |
| `CANCEL_REQUEST` | Driver cancels | Show cancellation modal, reset to step 1 |

---

## Partner (driver) side

### Screens

| Screen | Description |
|---|---|
| Home | Map view, shows online/offline toggle |
| RideRequest incoming | Popup with pickup/dropoff, price — accept or deny |
| Ride | Navigate to pickup → confirm pickup → navigate to dropoff |
| RideSummary | Fare earned for completed ride |

### Socket.io events received (partner)

| Event | Triggered by | Action |
|---|---|---|
| `NEW_REQUEST` | New client request | Show request popup |
| `CANCEL_REQUEST` | Client cancels | Dismiss popup |

---

## Provider API calls during a ride

| Action | Endpoint | Called by |
|---|---|---|
| Search ride prices | `POST /rides/newRequest` (price fetch) | `useRide` |
| Create ride request | `POST /rides/newRequest` | `useRide` |
| Cancel request | `POST /rides/cancelNewRequest` | `useRide` |
| Accept request | `POST /rides/acceptRequest` | `useRequest` (partner) |
| Deny request | `POST /rides/denyRequest` | `useRequest` (partner) |
| Mark driver arrived | `POST /rides/driverArrived` | partner home |
| End ride | `POST /rides/endRide` | partner home |
| Submit review | `POST /rides/review` | Review screen |
