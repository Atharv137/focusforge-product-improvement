let items = [
  { id: 1, title: 'Mini Fridge', price: 40, description: 'Slightly used, works great.', status: 'AVAILABLE', ownerId: 'user1', claimedBy: null, expiresAt: null },
  { id: 2, title: 'Introduction to Algorithms', price: 20, description: 'Barely touched textbook.', status: 'AVAILABLE', ownerId: 'user1', claimedBy: null, expiresAt: null },
  { id: 3, title: 'Desk Lamp', price: 0, description: 'Free to a good home.', status: 'AVAILABLE', ownerId: 'user2', claimedBy: null, expiresAt: null }
];

let nextId = 4;
const TIMEOUT_DURATION = 15000; // 15 seconds for testing Scenario 2

export const getItems = async () => {
    return new Promise(resolve => setTimeout(() => resolve([...items]), 300));
}

// Emulate a concurrency error if someone else grabs it in the meantime.
export const claimItem = async (itemId, userId, simulateDelay = false) => {
    return new Promise((resolve, reject) => {
        const processClaim = () => {
             const currentIndex = items.findIndex(i => i.id === itemId);
             if (currentIndex === -1) return reject(new Error('Item not found'));
             
             const item = items[currentIndex];
             if (item.status !== 'AVAILABLE') {
                 return reject(new Error('Concurrency Collision: Item is no longer available.'));
             }

             // Modify state
             items[currentIndex] = {
                 ...item,
                 status: 'CLAIMED',
                 claimedBy: userId,
                 expiresAt: Date.now() + TIMEOUT_DURATION
             };
             
             // Ghost Buyer Timer (Scenario 2)
             setTimeout(() => {
                 const checkIndex = items.findIndex(i => i.id === itemId);
                 if (checkIndex !== -1 && items[checkIndex].status === 'CLAIMED') {
                     // Timer expired, revert status
                     items[checkIndex] = {
                         ...items[checkIndex],
                         status: 'AVAILABLE',
                         claimedBy: null,
                         expiresAt: null
                     };
                     // Dispatch an event so UI can react in a real app, but here we expect polling or user refresh
                     console.log(`Item ${itemId} claim expired. Reverting to AVAILABLE.`);
                 }
             }, TIMEOUT_DURATION);

             resolve(items[currentIndex]);
        };

        if (simulateDelay) {
            setTimeout(processClaim, 2000); 
        } else {
            setTimeout(processClaim, 300);
        }
    });
}

// Hallway Sale override (Scenario 3)
export const forceRemoveItem = async (itemId, ownerId) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const currentIndex = items.findIndex(i => i.id === itemId);
            if (currentIndex === -1) return reject(new Error('Item not found'));
            
            const item = items[currentIndex];
            if (item.ownerId !== ownerId) {
                return reject(new Error('Unauthorized'));
            }

            items.splice(currentIndex, 1);
            resolve({ success: true });
        }, 200);
    });
}

export const createListing = async (listingData, ownerId) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newItem = {
                id: nextId++,
                ...listingData,
                status: 'AVAILABLE',
                ownerId,
                claimedBy: null,
                expiresAt: null
            };
            items.push(newItem);
            resolve(newItem);
        }, 400);
    });
}

export const confirmHandoff = async (itemId, userId) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
             const currentIndex = items.findIndex(i => i.id === itemId);
             const item = items[currentIndex];
             if (item.status !== 'CLAIMED' || item.claimedBy !== userId) {
                 return reject(new Error('Cannot confirm this handoff.'));
             }
             items[currentIndex] = { ...item, status: 'COMPLETED' };
             resolve(items[currentIndex]);
        }, 200);
    });
}
