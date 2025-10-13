### 🧠 Queue-Based Locking — Realistic Booking System

In high-concurrency systems (like bus or ticket booking), multiple users may try to book the same seat at once.

A simple “lock” rejects others, but that’s not user-friendly.

So instead, we use a **Queue-Based Lock**:
- When a resource (like a trip) is busy, other requests **wait in line**.
- Each booking executes **one after another** — first come, first served.
- This avoids race conditions **and** prevents user frustration.

This idea is similar to **a mutex with waiting queue** — often implemented with:
- In-memory queues (for single instance apps)
- Redis or Message Queues (for distributed systems)

```js
// queue-lock.mjs
class TransportTracker {
    constructor() {
        this.trips = [{ id: 1, seats: 2 }];
        this.bookings = [];
        this.locks = new Map(); // tripId -> promise chain
    }

    async bookTrip(studentId, tripId) {
        if (!this.locks.has(tripId)) {
            this.locks.set(tripId, Promise.resolve()); // initialize empty queue
        }

        // Add this booking to the queue chain
        const chain = this.locks.get(tripId).then(async () => {
            console.log(`🕐 Student ${studentId} is processing trip ${tripId}...`);

            // Simulate async DB delay
            await new Promise(res => setTimeout(res, Math.random() * 1000));

            const trip = this.trips.find(t => t.id === tripId);

            if (trip.seats > 0) {
                trip.seats--;
                this.bookings.push({ studentId, tripId });
                console.log(`✅ Student ${studentId} booked successfully.`);
            } else {
                console.log(`❌ Student ${studentId} failed — no seats left.`);
            }
        });

        // Update the queue chain for this trip
        this.locks.set(tripId, chain);
        await chain;
    }
}

const tracker = new TransportTracker();

(async () => {
    await Promise.all([
        tracker.bookTrip(1, 1),
        tracker.bookTrip(2, 1),
        tracker.bookTrip(3, 1),
        tracker.bookTrip(4, 1),
    ]);

    console.log("\n📊 Final State:");
    console.log("Seats left:", tracker.trips[0].seats);
    console.log("Bookings:", tracker.bookings);
})();

// Sample Output:
// 🕐 Student 1 is processing trip 1...
// ✅ Student 1 booked successfully.
// 🕐 Student 2 is processing trip 1...
// ✅ Student 2 booked successfully.
// 🕐 Student 3 is processing trip 1...
// ❌ Student 3 failed — no seats left.
// 🕐 Student 4 is processing trip 1...
// ❌ Student 4 failed — no seats left.
//
// 📊 Final State:
//     Seats left: 0
// Bookings: [ { studentId: 1, tripId: 1 }, { studentId: 2, tripId: 1 } ]


```