import sampleWishlistData from './sampleWishlistData';

// This is a mock service for getting kost details
// In a real application, this would make an API call to your backend

// Simulate network conditions (for testing async behavior)
const simulateNetworkCondition = () => {
  // Randomly determine if this request should succeed or fail (80% success rate)
  const shouldSucceed = Math.random() < 0.8;
  
  // Random delay between 300ms and 1500ms to simulate network latency
  const delay = Math.floor(Math.random() * 1200) + 300;
  
  return { shouldSucceed, delay };
};

export const getKostById = async (kostId) => {
  try {
    // Get simulated network conditions
    const { shouldSucceed, delay } = simulateNetworkCondition();
    
    // Wait for the "network" delay
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Simulate network error
    if (!shouldSucceed) {
      throw new Error('Network error');
    }
    
    // Find the kost from our sample data
    const kost = sampleWishlistData.find(item => item.kostId === kostId);
    
    if (!kost) {
      throw new Error('Kost not found');
    }
    
    // Add more details that would typically come from a detailed API call
    return {
      ...kost,
      description: 'This is a comfortable and affordable kost with great amenities. Located in a strategic area with easy access to public transportation, shops, and restaurants.',
      facilities: [
        'Free Wi-Fi', 
        'AC', 
        'Shared Kitchen', 
        'Laundry Service', 
        'Security 24/7'
      ],
      rules: [
        'No smoking inside the room',
        'No pets allowed',
        'Visitor hours: 08:00 - 21:00',
        'Keep noise to a minimum after 22:00'
      ],
      contact: {
        name: 'Owner Name',
        phone: '+62812XXXXXXXX',
        email: 'owner@example.com'
      }
    };
  } catch (error) {
    console.error('Error fetching kost details:', error);
    throw error; // Re-throw to allow components to handle the error
  }
};
