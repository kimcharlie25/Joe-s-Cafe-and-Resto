import React, { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { CartItem } from '../types';
import { useOrders } from '../hooks/useOrders';

interface BarCounterCheckoutProps {
  cartItems: CartItem[];
  totalPrice: number;
  onBack: () => void;
  onOrderComplete: () => void;
}

interface OrderCompletedModalProps {
  onClose: () => void;
}

const OrderCompletedModal: React.FC<OrderCompletedModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Order Completed</h2>
          <p className="text-gray-600 mb-6">Your order has been successfully placed.</p>
          <button
            onClick={onClose}
            className="w-full bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-700 transition-all duration-200 font-semibold"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

const BarCounterCheckout: React.FC<BarCounterCheckoutProps> = ({ 
  cartItems, 
  totalPrice, 
  onBack,
  onOrderComplete 
}) => {
  const { createOrder, creating, error } = useOrders();
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uiNotice, setUiNotice] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    // Validation
    if (!customerName.trim()) {
      setUiNotice('Please enter your name');
      return;
    }

    if (!tableNumber.trim()) {
      setUiNotice('Please enter a table number');
      return;
    }

    if (cartItems.length === 0) {
      setUiNotice('Your cart is empty');
      return;
    }

    setUiNotice(null);

    try {
      // Create order with counter service type
      // Use table number as contact number (required field) and in notes
      const orderNotes = notes.trim() 
        ? `Table: ${tableNumber} | ${notes}`
        : `Table: ${tableNumber}`;

      await createOrder({
        customerName: customerName.trim(),
        contactNumber: tableNumber.trim(), // Using table number as contact number
        serviceType: 'counter',
        paymentMethod: 'counter', // Using 'counter' as payment method placeholder
        notes: orderNotes,
        total: totalPrice,
        items: cartItems,
      });

      // Show success modal
      setShowSuccessModal(true);
    } catch (e) {
      const raw = e instanceof Error ? e.message : '';
      if (/insufficient stock/i.test(raw)) {
        setUiNotice(raw);
        return;
      }
      if (/rate limit/i.test(raw)) {
        setUiNotice('Too many orders: Please wait 1 minute before placing another order.');
      } else {
        setUiNotice('Failed to place order. Please try again.');
      }
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    onOrderComplete();
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors duration-200 mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Cart</span>
            </button>
            <h1 className="text-3xl font-playfair font-semibold text-black">Place Order</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Customer Information Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Information</h2>
                
                {uiNotice && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{uiNotice}</p>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  {/* Table Number */}
                  <div>
                    <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Table Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="tableNumber"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter table number"
                      required
                    />
                  </div>

                  {/* Service Type (Fixed to Counter) */}
                  <div>
                    <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-2">
                      Service Type
                    </label>
                    <input
                      type="text"
                      id="serviceType"
                      value="Counter"
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Special Instructions
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      placeholder="Any special requests or instructions..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        {item.selectedVariation && (
                          <p className="text-xs sm:text-sm text-gray-600">Size: {item.selectedVariation.name}</p>
                        )}
                        {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                          <p className="text-xs sm:text-sm text-gray-600">
                            Add-ons: {item.selectedAddOns.map(a => a.name).join(', ')}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₱{(item.totalPrice * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-primary-600">₱{totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={creating || cartItems.length === 0}
                  className="w-full bg-primary-600 text-white py-4 rounded-xl hover:bg-primary-700 transition-all duration-200 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed mt-6"
                >
                  {creating ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Completed Modal */}
      {showSuccessModal && <OrderCompletedModal onClose={handleModalClose} />}
    </>
  );
};

export default BarCounterCheckout;

