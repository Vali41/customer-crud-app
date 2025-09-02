import { useState,useEffect } from "react";
import { useNavigate } from "react-router";
import CustomerListDetails from "./CustomerListDetails";



const CustomerListPage = () => {
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [customerToDeleteId, setCustomerToDeleteId] = useState(null);
    const [deleteMessage, setDeleteMessage] = useState('');
    const navigate = useNavigate();

    

    useEffect(() => {
      const fetchCustomers = async () => {
      try {
        const url = new URL('https://customer-crud-app-backend-project.onrender.com/api/customers');
        url.searchParams.append('search', search);
        url.searchParams.append('page', page);
        url.searchParams.append('limit', 10);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCustomers(data.data);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
      fetchCustomers();
    }, [search, page]);

    // Handler to initiate the delete confirmation process
    const handleDelete = (id) => {
      setCustomerToDeleteId(id);
      setShowDeleteConfirm(true);
    };

    // Handler to perform the delete after confirmation
    const confirmDelete = async () => {
      try {
        const response = await fetch(`https://customer-crud-app-backend-project.onrender.com/api/customers/${customerToDeleteId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete customer');
        }
        // Update state to remove the deleted customer
        setCustomers(customers.filter(customer => customer.id !== customerToDeleteId));
        setDeleteMessage('Customer successfully deleted!');
        setTimeout(() => setDeleteMessage(''), 3000); 
      } catch (error) {
        console.error('Error deleting customer:', error);
        setDeleteMessage('Error deleting customer.');
        setTimeout(() => setDeleteMessage(''), 3000); 
      } finally {
        setShowDeleteConfirm(false);
        setCustomerToDeleteId(null);
      }
    };

    return (
      <div className='bg-light min-vh-100 p-4'>
        <div className="container">
          <h1 className='text-primary fw-bold text-center my-4'>Customers List</h1>
          
          {deleteMessage && (
            <div className="alert alert-success text-center" role="alert">
              {deleteMessage}
            </div>
          )}

          <div className='d-flex flex-column flex-md-row justify-content-between align-items-center mb-4'>
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='form-control w-100 w-md-50 me-md-3 mb-2 mb-md-0'
            />
            <button 
              onClick={() => navigate('/customers/new')} 
              className='btn btn-success fw-bold w-100 w-md-auto'
            >
              Add New Customer
            </button>
          </div>

          <div className="card shadow-sm p-3">
            <div className="table-responsive">
              <table className='table table-hover table-striped'>
                <thead className='table-primary'>
                  <tr className="">
                    <th scope="col" className='align-middle'>Name</th>
                    <th scope="col" className='align-middle'>Phone</th>
                    <th scope="col" className='align-end text-end'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(eachCustomer => (
                    <CustomerListDetails 
                      key={eachCustomer.id} 
                      customer={eachCustomer} 
                      onDelete={handleDelete} 
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className='d-flex justify-content-center align-items-center mt-3'>
              <button 
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))} 
                disabled={page === 1}
                className="btn btn-outline-secondary me-2"
              >
                Previous
              </button>
              <span className="fw-bold text-muted mx-3"> Page {page} of {totalPages} </span>
              <button 
                onClick={() => setPage((prev) => prev + 1)} 
                disabled={page === totalPages}
                className="btn btn-outline-secondary"
              >
                Next
              </button>
            </div>
          </div>
        </div>
        
        {/* Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Delete</h5>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this customer?</p>
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

  export default CustomerListPage;