// client/src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CustomerListPage from './components/CustomerListPage';
import CustomerDetailPage from './components/CustomerDetailPage';
import CustomerFormPage from './components/CustomerFormPage';
import AddressFormPage from './components/AddressFormPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CustomerListPage />} />
        <Route path="/customers/:id" element={<CustomerDetailPage />} />
        <Route path="/customers/new" element={<CustomerFormPage />} />
        <Route path="/customers/edit/:id" element={<CustomerFormPage />} />
        <Route path="/customers/:id/addresses/new" element={<AddressFormPage />} />
        <Route path="/customers/:id/addresses/edit/:addressId" element={<AddressFormPage />} />
      </Routes>
    </Router>
  );
}

export default App;