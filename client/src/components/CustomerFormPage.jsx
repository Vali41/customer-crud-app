// client/src/pages/CustomerFormPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';


const CustomerFormPage = () => {
    const { id } = useParams();
  
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
      first_name: '',
      last_name: '',
      phone_number: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      // If there's an ID in the URL, fetch the customer data
      if (id) {
        setLoading(true);
        fetch(`https://customer-crud-app-backend-project.onrender.com/api/customers/${id}`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Customer not found');
            }
            return response.json();
          })
          .then(data => {
            setFormData(data.data);
          })
          .catch(error => console.error('Error fetching customer:', error))
          .finally(() => setLoading(false));
      } else {
        // If there's no ID, clear the form for a new customer
        setFormData({
          first_name: '',
          last_name: '',
          phone_number: ''
        });
      }
    }, [id]);
 
     
    const validateForm = () => {
      const newErrors = {};
      if (!formData.first_name) newErrors.first_name = 'First name is required';
      if (!formData.last_name) newErrors.last_name = 'Last name is required';
      if (!formData.phone_number) newErrors.phone_number = 'Phone number is required';
      else if (!/^\d{10}$/.test(formData.phone_number)) {
        newErrors.phone_number = 'Phone number must be 10 digits';
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateForm()) return;
      try {
        const url = `https://customer-crud-app-backend-project.onrender.com/api/customers${id ? `/${id}` : ''}`;
        const method = id ? 'PUT' : 'POST';
        const response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Failed to save customer.');
        }
        navigate('/');
      } catch (error) {
        console.error('Error saving customer:', error);
        setErrors({ form: error.message });
      }
    };
    
    return (
      <div className='container my-5'>
        <div className="card shadow-sm p-4">
          <h1 className="text-center mb-4">{id ? 'Edit Customer' : 'Add New Customer'}</h1>
          {loading ? (
            <p className="text-center text-muted">Loading customer data...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="firstName" className="form-label">First Name:</label>
                <input
                  id="firstName"
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="form-control"
                />
                {errors.first_name && <span className="text-danger">{errors.first_name}</span>}
              </div>
              <div className="mb-3">
                <label htmlFor="lastName" className="form-label">Last Name:</label>
                <input
                  id="lastName"
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="form-control"
                />
                {errors.last_name && <span className="text-danger">{errors.last_name}</span>}
              </div>
              <div className="mb-3">
                <label htmlFor="phoneNumber" className="form-label">Phone Number:</label>
                <input
                  id="phoneNumber"
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="form-control"
                />
                {errors.phone_number && <span className="text-danger">{errors.phone_number}</span>}
              </div>
              {errors.form && <div className="alert alert-danger">{errors.form}</div>}
              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-primary fw-bold">{id ? 'Update Customer' : 'Save Customer'}</button>
              </div>
            </form>
          )}
          <div className="text-center mt-3">
            <button onClick={() => navigate('/')} className="btn btn-link">Back to List</button>
          </div>
        </div>
      </div>
    );
  };
  

export default CustomerFormPage;