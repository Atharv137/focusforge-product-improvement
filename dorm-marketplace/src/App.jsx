import React, { useState, useEffect } from 'react';
import { getItems, createListing, claimItem, forceRemoveItem, confirmHandoff } from './api/mockBackend';

function App() {
  const [currentUser, setCurrentUser] = useState('user1');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState('');

  // Listing form state
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('0');
  const [description, setDescription] = useState('');

  const fetchItems = async () => {
    try {
      const data = await getItems();
      setItems(data);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // Poll to keep UI in sync with backend ghost buyer timers
    const interval = setInterval(fetchItems, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !description) return;
    await createListing({ title, price: Number(price), description }, currentUser);
    setTitle(''); setPrice('0'); setDescription('');
    fetchItems();
  }

  const handleClaim = async (itemId, simulateDelay = false) => {
    try {
      setErrorDetails(''); // clear errs
      await claimItem(itemId, currentUser, simulateDelay);
      fetchItems();
    } catch (err) {
      alert("Error: " + err.message);
      setErrorDetails(err.message);
      fetchItems();
    }
  }

  const handleRemove = async (itemId) => {
    try {
      await forceRemoveItem(itemId, currentUser);
      fetchItems();
    } catch (err) {
      alert(err.message);
    }
  }

  const handleConfirmPickup = async (itemId) => {
    try {
      await confirmHandoff(itemId, currentUser);
      fetchItems();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="app-container">
      <header>
        <h1>Dorm Marketplace</h1>
        <div className="user-selector">
          <span>Active User: </span>
          <select value={currentUser} onChange={(e) => setCurrentUser(e.target.value)}>
            <option value="user1">User 1</option>
            <option value="user2">User 2</option>
            <option value="user3">User 3</option>
          </select>
        </div>
      </header>

      <main>
        {errorDetails && (
          <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', borderRadius: '8px', color: '#fca5a5' }}>
            <strong>Action Failed:</strong> {errorDetails}
          </div>
        )}

        <section className="form-container">
          <h2>List an Item</h2>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Title</label>
              <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Mini Fridge" />
            </div>
            <div className="form-group">
              <label>Price ($)</label>
              <input type="number" value={price} onChange={e=>setPrice(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={description} onChange={e=>setDescription(e.target.value)} rows="3" />
            </div>
            <button className="btn" type="submit">Publish Listing</button>
          </form>
        </section>

        <section>
          <h2>Marketplace Feed</h2>
          
          <div className="scene-controls">
            <strong>Testing Scenarios Guide:</strong>
            <ul style={{ marginLeft: '20px', marginTop: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <li><strong>Scenario 1 (Concurrency):</strong> Open two tabs as different users, try claiming exact same item. Alternatively, use "Claim (Slow)" to cause an artificial network delay while another user claims it instantly.</li>
              <li><strong>Scenario 2 (Ghost Buyer):</strong> Claim an item. Do not click 'Confirm Pickup'. Wait 15 seconds. The timer will expire and revert it to AVAILABLE.</li>
              <li><strong>Scenario 3 (Hallway Sale):</strong> Create an item. Then click "Mark Sold (Remove)". It ignores the standard flow and forces it out of the marketplace.</li>
            </ul>
          </div>

          {loading ? (
            <p>Loading items...</p>
          ) : (
            <div className="grid">
              {items.filter(i => i.status !== 'COMPLETED').map(item => {
                const isOwner = item.ownerId === currentUser;
                const isClaimer = item.claimedBy === currentUser;

                return (
                  <div key={item.id} className="card">
                    <div className="card-header">
                      <h3>{item.title}</h3>
                      <span className={`status-badge status-${item.status}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="price">${item.price}</div>
                    <p className="desc">{item.description}</p>

                    <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                      {item.status === 'AVAILABLE' && !isOwner && (
                        <div style={{display:'flex', gap: '0.5rem'}}>
                          <button className="btn" onClick={() => handleClaim(item.id)}>Claim Item</button>
                          <button className="btn" style={{backgroundColor: '#475569'}} onClick={() => handleClaim(item.id, true)} title="Simulates a 2s delay to easily test concurrency collisions by giving you a window to claim it on another account.">Claim (Slow)</button>
                        </div>
                      )}
                      
                      {item.status === 'CLAIMED' && isClaimer && (
                        <div>
                          <button className="btn btn-success" style={{backgroundColor: 'var(--success)'}} onClick={() => handleConfirmPickup(item.id)}>Pick Up Complete!</button>
                          <div className="timer">Pick up must be completed soon, or claim expires.</div>
                        </div>
                      )}

                      {item.status === 'CLAIMED' && !isClaimer && !isOwner && (
                         <button className="btn" disabled>Already Claimed</button>
                      )}

                      {isOwner && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Your Listing</span>
                          <button className="btn btn-danger" onClick={() => handleRemove(item.id)}>Mark Sold (Remove)</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
