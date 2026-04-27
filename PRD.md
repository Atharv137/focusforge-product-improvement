# Phase 1 — Product Plan

## 1. Scope Cut

1. **Payments / In-App Transactions:** Handled strictly via in-person handoffs. Implementing a payment gateway introduces unnecessary complexity for a MVP focused on discovering used campus goods.
2. **Real-time Live Chat:** Building a WebSocket chat infrastructure goes beyond the core requirement of claiming items. Basic contact info visibility after claiming is sufficient for the first version.
3. **Complex Delivery or Shipping logistics:** The platform is scoped specifically to students in a common geographical area (dorms). In-person meetups remove the need for tracking codes and shipping APIs.

## 2. MVP Features

1. **Listing Feed:** Users can view a list of all available items placed on the marketplace by other students, ensuring discovery.
2. **Item Creation (Listing):** Users can add their unwanted goods (e.g., mini-fridges, textbooks) providing a title, price, and description for others to see.
3. **Claiming System:** A user can explicitly place a claim on an available item, putting it in a reserved state and initiating the handoff phase.

## 3. Acceptance Criteria

**Scenario:** Claiming an Item

1. **Success (Happy Path):** 
   - **Given** an item is listed as "Available" and I am logged in/active
   - **When** I click the "Claim Item" button
   - **Then** the item's state immediately shifts to "Claimed", preventing others from claiming it, and I receive confirmation.

2. **Concurrency Collision Override:**
   - **Given** an item is listed as "Available"
   - **When** I attempt to click "Claim Item" but someone else claimed it milliseconds before my request hits the server
   - **Then** my request is rejected, the item's state correctly reflects the other user's claim, and I an error message indicates it's no longer available.

3. **Expiration (The Ghost Buyer):**
   - **Given** I successfully claim an item 
   - **When** I fail to complete the required final handoff confirmation within the designated time limit (e.g., 30 simulated seconds)
   - **Then** my claim expires, the lock on the item is removed, and its status resets to "Available" for others to claim.
