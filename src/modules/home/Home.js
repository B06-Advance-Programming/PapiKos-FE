import RecommendedKosts from './RecommendedKosts';
import './Home.css';

function Home() {
  // In a real app, this would come from your auth context
  const userId = "1";

  return (
    <div className="home-container">
      <div className="hero">
        <div className="hero-content">
          <h1>Find Your Perfect Kost</h1>
          <p>Discover comfortable kosts at affordable prices in your desired location</p>
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search for a location..." 
              className="search-input"
            />
            <button className="search-button">Search</button>
          </div>
        </div>
      </div>

      <div className="content-container">
        <RecommendedKosts userId={userId} />
      </div>
    </div>
  );
}

export default Home;