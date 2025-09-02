import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; 

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addressToDeleteId, setAddressToDeleteId] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState('');

  useEffect(() => {
    const fetchCustomer = async () => {
    
      setLoading(true);
      setError(null);

      try {
        
        const [customerResponse, addressResponse] = await Promise.all([
          fetch(`https://customer-crud-app-backend-project.onrender.com/api/customers/${id}`),
          fetch(`https://customer-crud-app-backend-project.onrender.com/api/customers/${id}/addresses`),
        ]);

        if (!customerResponse.ok) {
          throw new Error(`Failed to fetch customer. Status: ${customerResponse.status}`);
        }
        if (!addressResponse.ok) {
          throw new Error(`Failed to fetch addresses. Status: ${addressResponse.status}`);
        }

        const customerData = await customerResponse.json();
        const addressData = await addressResponse.json();
        console.log('Fetched customer data:', customerData);
        console.log('Fetched address data:', addressData);
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
  
  const handleDelete = (id) => {
      setAddressToDeleteId(id);
      setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
      try {
        const response = await fetch(`https://customer-crud-app-backend-project.onrender.com/api/customers/${id}/addresses/${addressToDeleteId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete address');
        }
        // Update state to remove the deleted address
        setAddresses(addresses.filter(address => address.id !== addressToDeleteId));
        setDeleteMessage('Address successfully deleted!');
        setTimeout(() => setDeleteMessage(''), 3000); // Clear message after 3 seconds
      } catch (error) {
        console.error('Error deleting address:', error);
        setDeleteMessage('Error deleting address.');
        setTimeout(() => setDeleteMessage(''), 3000); // Clear message after 3 seconds
      } finally {
        setShowDeleteConfirm(false);
        setAddressToDeleteId(null);
      }
    };

  const handleEditAddress = (address) => {
    navigate(`/customers/${id}/addresses/edit/${address.id}`, { state: { address } });
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <p>Loading Address details...</p>
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
           {deleteMessage && (
            <div className="alert alert-success text-center" role="alert">
              {deleteMessage}
            </div>
          )}
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
            <button
              className="btn btn-sm btn-primary me-2"
              onClick={() => handleEditAddress(address)}
            >
              Edit
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => handleDelete(address.id)}
            >
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
      {showDeleteConfirm && (
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Delete</h5>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this address?</p>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger" 
                    onClick={confirmDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default CustomerDetailPage;