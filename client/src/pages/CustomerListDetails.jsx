
import {useNavigate} from 'react-router';

const CustomerListDetails = ({ customer, onDelete }) => {
    const navigate = useNavigate();
    if (!customer) {
      return null;
    }
    return (
      <tr className="align-middle">
        <td className="align-middle">{customer.first_name} {customer.last_name}</td>
        <td className="align-middle">{customer.phone_number}</td>
        <td className="text-end">
          <button 
            onClick={() => navigate(`/customers/${customer.id}`)} 
            className="btn btn-primary btn-sm me-2"
          >
            View
          </button>
          <button 
            onClick={() => onDelete(customer.id)} 
            className="btn btn-danger btn-sm"
          >
            Delete
          </button>
        </td>
      </tr>
    );
  };

export default CustomerListDetails;
