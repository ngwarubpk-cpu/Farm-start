# Security Specification for FarmSmart

## Data Invariants
1. A garden item must belong to a valid authenticated user (`userId` in path).
2. A garden item must reference a `cropId` (relational integrity).
3. Crops and Guides are curated content and should not be modifiable by regular users.
4. Users can only access their own private garden data.

## The "Dirty Dozen" Payloads

### 1. Identity Spoofing (Garden Item)
Attempt to write to someone else's garden.
**Payload:** `setDoc(doc(db, 'users/OTHER_UID/garden/item1'), { cropId: 'carrot', ... })`
**Expectation:** `PERMISSION_DENIED`

### 2. Impersonation (Owner Field)
Attempt to set a garden item with a different `ownerId` (if we had one in data).
**Payload:** `{ cropId: 'carrot', userId: 'OTHER_UID' }` (Path is correct, but data is wrong)
**Expectation:** `PERMISSION_DENIED`

### 3. Unauthorized Content Creation (Crops)
Regular user trying to add a new crop.
**Payload:** `addDoc(collection(db, 'crops'), { name: 'Super Weed' })`
**Expectation:** `PERMISSION_DENIED`

### 4. Malicious ID (Path Injection)
Using a very long or special character string as a document ID.
**Payload:** `setDoc(doc(db, 'users/UID/garden/' + 'A'.repeat(2000)), { ... })`
**Expectation:** `PERMISSION_DENIED` (size check)

### 5. Type Poisoning (String vs Boolean)
Sending a boolean for a required string field.
**Payload:** `{ cropId: true, addedAt: '...' }`
**Expectation:** `PERMISSION_DENIED`

### 6. Overflow Attack (Large payload)
Sending a 1MB string in `notes`.
**Payload:** `{ cropId: 'carrot', notes: 'A'.repeat(1000000) }`
**Expectation:** `PERMISSION_DENIED` (size check)

### 7. Resource Exhaustion (Array size)
Sending an array with 10,000 items in a field.
**Payload:** `{ cropId: 'carrot', tags: Array(10000).fill('tag') }`
**Expectation:** `PERMISSION_DENIED`

### 8. Backdating (Timestamp manipulation)
Attempt to set `addedAt` to the past manually.
**Payload:** `{ cropId: 'carrot', addedAt: '2010-01-01...' }`
**Expectation:** `PERMISSION_DENIED` (server timestamp required)

### 9. Field Injection (Shadow fields)
Adding `isPremium: true` to a garden item.
**Payload:** `{ cropId: 'carrot', addedAt: '...', isPremium: true }`
**Expectation:** `PERMISSION_DENIED` (`hasOnly` gate)

### 10. Relational Orphan
Creating a garden item for a non-existent crop (if we enforce existence).
**Payload:** `{ cropId: 'non-existent', ... }`
**Expectation:** `PERMISSION_DENIED` (relational exists check)

### 11. Read Scaping (Users collection)
Attempting to list all users' garden items.
**Payload:** `getDocs(query(collectionGroup(db, 'garden')))`
**Expectation:** `PERMISSION_DENIED`

### 12. PII Leak (User profile)
Getting email of another user if we stored it in `/users/{userId}`.
**Expectation:** `PERMISSION_DENIED`

## Test Runner Logic
The `firestore.rules.test.ts` will implement these checks using the `@firebase/rules-unit-testing` or similar approach conceptually, verifying each boundary.
