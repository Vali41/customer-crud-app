import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Assuming you use react-router-dom

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      // Reset state on ID change before fetching
      setLoading(true);
      setError(null);

      try {
        // Fetch customer and addresses in parallel for better performance
        const [customerResponse, addressResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/customers/${id}`),
          fetch(`http://localhost:5000/api/customers/${id}/addresses`),
        ]);

        if (!customerResponse.ok) {
          throw new Error(`Failed to fetch customer. Status: ${customerResponse.status}`);
        }
        if (!addressResponse.ok) {
          throw new Error(`Failed to fetch addresses. Status: ${addressResponse.status}`);
        }

        const customerData = await customerResponse.json();
        const addressData = await addressResponse.json();

        setCustomer(customerData.data);
        setAddresses(addressData.data);
      } catch (err) {
        console.error('Error fetching customer details:', err);
        setError('Failed to load customer details. Please check the ID and try again.');
        setCustomer(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCustomer();
    }
  }, [id]);
  
  // --- FIX FOR DELETE ACTION ---
  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        // 1. Use the correct API endpoint from your backend server.
        // 2. Use the actual `addressId` variable in the URL.
        const response = await fetch(`http://localhost:5000/api/addresses/${addressId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          // Provide more specific error feedback
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        // 3. Update the state only AFTER the API call is successful.
        setAddresses(prevAddresses => prevAddresses.filter(address => address.id !== addressId));
        
      } catch (err) {
        console.error('Error deleting address:', err);
        // 4. Use a non-disruptive alert for action errors instead of replacing the page.
        alert(`Failed to delete address: ${err.message}`);
      }
    }
  };

  // --- EDIT ACTION LOGIC ---
  // This function is correct. It navigates to the edit page.
  // The actual editing will happen in the component for that route.
  const handleEditAddress = (address) => {
    navigate(`/customers/${id}/addresses/edit/${address.id}`, { state: { address } });
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <p>Loading customer details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5 text-center alert alert-danger">
        <p>{error}</p>
        <button onClick={() => navigate('/')} className="btn btn-primary mt-3">Back to List</button>
      </div>
    );
  }
  
  if (!customer) {
    // This handles the case where loading is false but customer is still null
    return (
      <div className="container mt-5 text-center">
        <p>Customer not found.</p>
        <button onClick={() => navigate('/')} className="btn btn-primary mt-3">Back to List</button>
      </div>
    );
  }
  
  return (
    <div className='bg-light min-vh-100 p-4'>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className='text-primary fw-bold'>Customer Details</h1>
          <button onClick={() => navigate('/')} className="btn btn-dark">Back to List</button>
        </div>
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title text-center mb-4 fs-4">{customer.first_name} {customer.last_name}</h5>
            <hr />
            <ul className="list-group list-group-flush">
              <li className="list-group-item"><span className="fw-bold">First Name:</span> {customer.first_name}</li>
              <li className="list-group-item"><span className="fw-bold">Last Name:</span> {customer.last_name}</li>
              <li className="list-group-item"><span className="fw-bold">Phone Number:</span> {customer.phone_number}</li>
            </ul>
          </div>
          <div className="card-footer text-end bg-light border-0">
            <button 
              onClick={() => navigate(`/customers/edit/${customer.id}`)} 
              className="btn btn-primary fw-bold"
            >
              Edit Details
            </button>
          </div>
        </div>
      </div>
      <div className="container mt-5">
        <div className=" d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-primary fw-bold">Customer Addresses</h2>
          <button onClick={() => navigate(`/customers/${id}/addresses/new`)} className="btn btn-primary">
            Add New Address
          </button>
        </div>
        
        {addresses.length === 0 ? (
          <p>No addresses found for this customer.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Address Details</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Pin Code</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {addresses.map((address) => (
                  <tr key={address.id}>
                    <td>{address.address_details}</td>
                    <td>{address.city}</td>
                    <td>{address.state}</td>
                    <td>{address.pin_code}</td>
                    <td>
                      <button className="btn btn-sm btn-primary me-2" onClick={() => handleEditAddress(address)}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteAddress(address.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetailPage;