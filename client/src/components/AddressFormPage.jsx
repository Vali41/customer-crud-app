import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";

const AddressFormPage = () => {
	const { id, addressId } = useParams(); // 'id' is customerId
	const location = useLocation();
	const { state } = location;

	console.log({ state });

	const [formData, setFormData] = useState({
		address_details: "",
		city: "",
		state: "",
		pin_code: "",
	});

	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const isEditMode = !!addressId;

	useEffect(() => {
		setFormData(state?.address || {
			address_details: "",
			city: "",
			state: "",
			pin_code: "",
		});
	}, [JSON.stringify(state?.address || {})]);


	const validateForm = () => {
		const newErrors = {};
		if (!formData.address_details.trim())
			newErrors.address_details = "Address details are required";
		if (!formData.city.trim()) newErrors.city = "City is required";
		if (!formData.state.trim()) newErrors.state = "State is required";
		if (!formData.pin_code.trim())
			newErrors.pin_code = "Pin code is required";
		else if (!/^\d{6}$/.test(formData.pin_code)) {
			newErrors.pin_code = "Pin code must be 6 digits";
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

		setLoading(true);
		setErrors({});

		// This URL is correct for both creating (POST) and updating (PUT) an address.
		const url = isEditMode
			? `https://customer-crud-app-backend-project.onrender.com/api/customers/${id}/addresses/${addressId}`
			: `https://customer-crud-app-backend-project.onrender.com/api/customers/${id}/addresses`;

		const method = isEditMode ? "PUT" : "POST";

		try {
			const response = await fetch(url, {
				method: method,
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			const result = await response.json();
			if (!response.ok) {
				throw new Error(result.error || "Failed to save address.");
			}

			// If the request was successful, navigate back to the customer detail page.
			window.location.href = `/customers/${id}`;
		} catch (error) {
			console.error("Error saving address:", error);
			setErrors({ form: error.message });
		} finally {
			setLoading(false);
		}
	};

	// If there's a form-level error (e.g., failed to fetch data), show a clear error message.
	if (errors.form && !loading) {
		return (
			<div className="container my-5 text-center">
				<div className="alert alert-danger">
					<p className="mb-0">{errors.form}</p>
				</div>
				<button
					className="btn btn-secondary mt-3"
					onClick={() => window.history.back()}
				>
					Go Back
				</button>
			</div>
		);
	}

	return (
		<div className="container my-4 my-md-5">
			<div className="row justify-content-center">
				<div className="col-lg-7 col-md-9">
					<div className="card shadow-lg p-4 p-md-5 border-0 rounded-3">
						<h1 className="text-center mb-4 fw-bold text-primary">
							{isEditMode ? "Edit Address" : "Add New Address"}
						</h1>
						{loading ? (
							<div className="text-center p-5">
								<div
									className="spinner-border text-primary"
									role="status"
								>
									<span className="visually-hidden">
										Loading...
									</span>
								</div>
								<p className="mt-2 text-muted">
									Loading address details...
								</p>
							</div>
						) : (
							<form onSubmit={handleSubmit} noValidate>
								<div className="row g-3">
									<div className="col-12">
										<label
											htmlFor="address_details"
											className="form-label"
										>
											Address Details
										</label>
										<textarea
											id="address_details"
											name="address_details"
											value={formData.address_details}
											onChange={handleChange}
											className={`form-control ${
												errors.address_details
													? "is-invalid"
													: ""
											}`}
											rows="3"
											disabled={loading}
										/>
										{errors.address_details && (
											<div className="invalid-feedback">
												{errors.address_details}
											</div>
										)}
									</div>
									<div className="col-md-6">
										<label
											htmlFor="city"
											className="form-label"
										>
											City
										</label>
										<input
											id="city"
											type="text"
											name="city"
											value={formData.city}
											onChange={handleChange}
											className={`form-control ${
												errors.city ? "is-invalid" : ""
											}`}
											disabled={loading}
										/>
										{errors.city && (
											<div className="invalid-feedback">
												{errors.city}
											</div>
										)}
									</div>
									<div className="col-md-6">
										<label
											htmlFor="state"
											className="form-label"
										>
											State
										</label>
										<input
											id="state"
											type="text"
											name="state"
											value={formData.state}
											onChange={handleChange}
											className={`form-control ${
												errors.state ? "is-invalid" : ""
											}`}
											disabled={loading}
										/>
										{errors.state && (
											<div className="invalid-feedback">
												{errors.state}
											</div>
										)}
									</div>
									<div className="col-md-6">
										<label
											htmlFor="pin_code"
											className="form-label"
										>
											Pin Code
										</label>
										<input
											id="pin_code"
											type="text"
											name="pin_code"
											value={formData.pin_code}
											onChange={handleChange}
											className={`form-control ${
												errors.pin_code
													? "is-invalid"
													: ""
											}`}
											maxLength="6"
											disabled={loading}
										/>
										{errors.pin_code && (
											<div className="invalid-feedback">
												{errors.pin_code}
											</div>
										)}
									</div>
								</div>

								<div className="d-grid gap-2 mt-4">
									<button
										type="submit"
										className="btn btn-primary fw-bold"
										disabled={loading}
									>
										{loading
											? "Saving..."
											: isEditMode
											? "Update Address"
											: "Save Address"}
									</button>
									<button
										type="button"
										className="btn btn-outline-secondary"
										onClick={() => window.history.back()}
										disabled={loading}
									>
										Cancel
									</button>
								</div>
							</form>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default AddressFormPage;
