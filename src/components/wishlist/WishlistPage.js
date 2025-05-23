import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getWishlist, removeFromWishlist} from '../../api/wishlistApi';
import { createCancellableRequest } from '../../api/apiUtils';
import WishlistItem from './WishlistItem';
import './WishlistPage.css';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingOperations, setPendingOperations] = useState({});
  
  // This should come from your authentication context in a real app
  // For now, we'll hardcode a user ID for testing
  const userId = "1"; // Replace with actual user ID from auth context
  
  // Use a ref to track if the component is mounted
  const isMounted = useRef(true);
  
  // Ref to store cancellation functions
  const cancelFunctions = useRef({});
  
  // Maximum number of retries before giving up
  const MAX_RETRIES = 3;
  
  // Fetch wishlist data with retry logic and cancellation support
  const fetchWishlist = useCallback(async (isRefresh = false) => {
    // If refreshing, update state to show refresh indicator
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    
    // Create cancellable request
    const requestId = `fetch-wishlist-${Date.now()}`;
    const { signal, cancel } = createCancellableRequest();
    
    // Store cancel function to allow cancellation from elsewhere
    cancelFunctions.current[requestId] = cancel;
    
    try {
      const data = await getWishlist(userId, {
        requestId,
        cancellable: true,
        signal,
        maxRetries: MAX_RETRIES,
        bypassCache: isRefresh // Bypass cache when explicitly refreshing
      });
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        setWishlist(data);
        setError(null);
        setRetryCount(0); // Reset retry count on success
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        // Don't increment retry count or show error if request was canceled
        if (err.name === 'AbortError') {
          console.log('Wishlist fetch was cancelled');
          return;
        }
        
        // If we haven't reached max retries, try again
        if (retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
          setError(`Failed to load wishlist. Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
          
          // Add exponential backoff
          const backoffDelay = Math.pow(2, retryCount) * 1000;
          setTimeout(() => {
            if (isMounted.current) {
              fetchWishlist(isRefresh);
            }
          }, backoffDelay);
        } else {
          setError('Failed to load wishlist. Please try again later.');
        }
      }
    } finally {
      // Cleanup the cancel function
      delete cancelFunctions.current[requestId];
      
      // Update loading states if component is still mounted
      if (isMounted.current) {
        setLoading(false);
        if (isRefresh) {
          setIsRefreshing(false);
        }
      }
    }
  }, [userId, retryCount]);
  
  // Handle removing items from wishlist with optimistic UI updates
  const handleRemoveFromWishlist = useCallback(async (itemId, kostId) => {
    // Generate operation ID for tracking this specific remove operation
    const operationId = `remove-${itemId}-${Date.now()}`;
    
    // Optimistically update UI by removing the item
    const updatedWishlist = wishlist.filter(item => item.id !== itemId);
    setWishlist(updatedWishlist);
    
    // Track pending operation
    setPendingOperations(prev => ({
      ...prev,
      [operationId]: { type: 'remove', itemId, kostId }
    }));
    
    try {
      // Create cancellable request
      const { signal, cancel } = createCancellableRequest();
      cancelFunctions.current[operationId] = cancel;
      
      // Actually remove from server
      await removeFromWishlist(userId, kostId, {
        requestId: operationId,
        signal,
        maxRetries: 2
      });
      
      // Operation succeeded
      console.log(`Successfully removed item ${itemId} from wishlist`);
    } catch (error) {
      console.error(`Failed to remove item ${itemId} from wishlist:`, error);
      
      // If not canceled, revert the optimistic update
      if (error.name !== 'AbortError' && isMounted.current) {
        setError(`Failed to remove item from wishlist: ${error.message}`);
        
        // Fetch fresh wishlist data to ensure UI is consistent with server
        fetchWishlist();
      }
    } finally {
      // Cleanup regardless of outcome
      delete cancelFunctions.current[operationId];
      
      if (isMounted.current) {
        setPendingOperations(prev => {
          const updated = { ...prev };
          delete updated[operationId];
          return updated;
        });
      }
    }
  }, [wishlist, userId, fetchWishlist]);
  
  // Load wishlist data when component mounts
  useEffect(() => {
    fetchWishlist();

    // ⬇ snapshot ref ke variabel lokal
    const cancelSnapshot = cancelFunctions.current;

    return () => {
      isMounted.current = false;

      // Gunakan snapshot yang tidak berubah
      Object.values(cancelSnapshot).forEach(cancel => {
        if (typeof cancel === 'function') cancel();
      });
    };
  }, [fetchWishlist]);

  const handleRefresh = () => {
    fetchWishlist(true);
  };
  
  // Render empty state when wishlist is empty
  const renderEmptyState = () => (
    <div className="wishlist-empty">
      <h3>Your wishlist is empty</h3>
      <p>Start adding boarding houses to your wishlist!</p>
      <Link to="/" className="btn-primary">Explore Kosts</Link>
    </div>
  );
  
  // Loading state
  if (loading && !isRefreshing) {
    return (
      <div className="wishlist-container">
        <h2>My Wishlist</h2>
        <div className="wishlist-loading">
          <div className="loading-spinner"></div>
          <p>Loading your wishlist...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <h2>My Wishlist</h2>
        <button 
          className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`}
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => fetchWishlist()}>Try Again</button>
        </div>
      )}
      
      {!loading && wishlist.length === 0 && !error ? (
        renderEmptyState()
      ) : (
        <div className="wishlist-items">
          {wishlist.map(item => (
            <WishlistItem
              key={item.id}
              item={item}
              onRemove={() => handleRemoveFromWishlist(item.id, item.kostId)}
              isPendingRemoval={Object.values(pendingOperations).some(
                op => op.type === 'remove' && op.itemId === item.id
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
