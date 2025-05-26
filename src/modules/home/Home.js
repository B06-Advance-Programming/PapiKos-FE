import RecommendedKosts from './RecommendedKosts';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <div className="hero">
        <div className="hero-content">
          <h1>Find Your Perfect Kost</h1>
          <p>Discover comfortable kosts at affordable prices in your desired location</p>
        </div>
      </div>

      <div className="content-container">
        <RecommendedKosts/>
      </div>
    </div>
  );
}

export default Home;