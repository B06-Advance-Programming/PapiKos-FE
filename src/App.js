import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './modules/home/Home';
import Login from './modules/auth/Login';
import Register from './modules/auth/Register';
import NotFound from './modules/NotFound'; 
import KuponList from './modules/kupon/kuponList';
import KuponDetail from './modules/kupon/kuponDetail';
import KuponForm from './modules/kupon/KuponForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/kupon" element={<KuponList />} />
        <Route path="/kupon/new" element={<KuponForm />} />
        <Route path="/kupon/:id" element={<KuponDetail />} />
        <Route path="/kupon/:id/edit" element={<KuponForm />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;