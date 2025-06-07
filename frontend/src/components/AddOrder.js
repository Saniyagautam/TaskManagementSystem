import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Container,
  FormControl,
  InputLabel,
  Select,
  Alert
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const AddOrder = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    customer: '',
    orderDate: new Date().toISOString().split('T')[0],
    items: [{
      name: '',
      quantity: 1,
      price: 0
    }],
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'cash',
    shippingAddress: {
      street: '',
    }
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(`${API_URL}/customers`);
        setCustomers(response.data);
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError('Failed to fetch customers. Please try again.');
      }
    };
    fetchCustomers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const handleShippingAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        [name]: value
      }
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, price: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (item.quantity * item.price);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // const { street, city, state, zipCode, country } = formData.shippingAddress;
      // if (!street || !city || !state || !zipCode || !country) {
      //   throw new Error('All shipping address fields are required');
      // }

      const orderData = {
        ...formData,
        totalAmount: calculateTotal()
      };

      const response = await axios.post(`${API_URL}/orders`, orderData);
      console.log('Order created:', response.data);
      navigate('/orders');
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.error || err.message || 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Task
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Order Date */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Due Date"
                  type="date"
                  name="orderDate"
                  value={formData.orderDate}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Customer Selection */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Assigned To</InputLabel>
                  <Select
                    name="customer"
                    value={formData.customer}
                    onChange={handleInputChange}
                    required
                    label="Customer"
                  >
                    {customers.map((customer) => (
                      <MenuItem key={customer._id} value={customer._id}>
                        {customer.name} - {customer.phone}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Items */}
              {formData.items.map((item, index) => (
                <Grid item xs={12} key={index} container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Task Title"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      required
                    />
                  </Grid>
                  
                </Grid>
              ))}

{/*               
            

              {/* Shipping Address */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Task Description
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="street"
                  value={formData.shippingAddress.street}
                  onChange={handleShippingAddressChange}
                  
                />
              </Grid>
              
               {/* Attached Files */}
            {/* <Grid item xs={12}>
              <Button variant="outlined" component="label" fullWidth>
                Upload Invoice or Related Documents
                <input
                  type="file"
                  hidden
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  // onChange={handleFileChange}
                />
              </Button>
              {formData.attachedDocs.length > 0 && (
                <Box mt={2}>
                  <Typography variant="body2">Selected Files:</Typography>
                  <ul>
                    {formData.attachedDocs.map((file, idx) => (
                      <li key={idx}>{file.name}</li>
                    ))}
                  </ul>
                </Box>
              )}
            </Grid> */}

             
              {/*  Status */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Task Status</InputLabel>
                  <Select
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleInputChange}
                    required
                    label="Payment Status"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="paid">Completed</MenuItem>
                    <MenuItem value="failed">Processing</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

            
              {/* Submit Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/orders')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Task'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default AddOrder; 