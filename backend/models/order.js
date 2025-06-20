// models/order.js

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    
  },
  items: [{
    name: {
      type: String,
     
    },
    quantity: {
      type: Number,
     
      min: 1
    },
    price: {
      type: Number,
     
      min: 0
    }
  }],
  totalAmount: {
    type: Number,
    
    min: 0
  },
  status: {
    type: String,
    
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    
    enum: ['cash', 'card', 'upi', 'bank_transfer']
  },
  shippingAddress: {
    street: {
      type: String,
     
    }
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Pre-save middleware to ensure totalAmount matches items
orderSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.totalAmount = this.items.reduce((total, item) => {
      return total + (item.quantity * item.price);
    }, 0);
  }
  next();
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      // Find the highest order number
      const highestOrder = await mongoose.model('Order')
        .findOne({}, { orderNumber: 1 })
        .sort({ orderNumber: -1 });

      if (highestOrder) {
        // Extract the number from the existing highest order number
        const currentNumber = parseInt(highestOrder.orderNumber.replace('ORD', ''));
        this.orderNumber = `ORD${(currentNumber + 1).toString().padStart(6, '0')}`;
      } else {
        // If no orders exist, start with ORD000001
        this.orderNumber = 'ORD000001';
      }

      // Verify uniqueness
      const existingOrder = await mongoose.model('Order').findOne({ orderNumber: this.orderNumber });
      if (existingOrder) {
        // If somehow the number exists, generate a timestamp-based unique number as fallback
        const timestamp = Date.now();
        this.orderNumber = `ORD${timestamp}`;
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
