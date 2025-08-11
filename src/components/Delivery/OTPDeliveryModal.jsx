import React, { useState } from 'react';
import { FiCheckCircle, FiXCircle, FiKey, FiPackage, FiClock } from 'react-icons/fi';
import Button from '../ui/Button';
import Input from '../ui/Input';
//import { useDeliveryPartnerStore } from '../../../store/Delivery/useDeliveryPartnerStore';
import { toast } from '../../utils/toast';
import {useDeliveryPartnerStore} from '../../store/Delivery/useDeliveryPartnerStore';

const OTPDeliveryModal = ({ isOpen, onClose, delivery }) => {
  const [step, setStep] = useState('initiate'); // 'initiate', 'verify', 'failed'
  const [otp, setOtp] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [failureReason, setFailureReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    initiateDeliveryWithOTP,
    completeDeliveryWithOTP,
    markDeliveryFailed,
    loading,
    error
  } = useDeliveryPartnerStore();

  if (!isOpen || !delivery) return null;

  const handleInitiateOTP = async () => {
    setIsProcessing(true);
    try {
      await initiateDeliveryWithOTP(delivery.order_id);
      toast.success('OTP sent to customer successfully!');
      setStep('verify');
    } catch (error) {
      toast.error('Failed to send OTP to customer');
      console.error('OTP initiation error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteDelivery = async () => {
    if (!otp.trim()) {
      toast.error('Please enter the OTP provided by customer');
      return;
    }

    setIsProcessing(true);
    try {
      await completeDeliveryWithOTP(delivery.order_id, otp.trim(), deliveryNotes);
      toast.success('Delivery completed successfully!');
      onClose();
      // Reset state
      setStep('initiate');
      setOtp('');
      setDeliveryNotes('');
    } catch (error) {
      toast.error(error || 'Invalid OTP. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkFailed = async () => {
    if (!failureReason.trim()) {
      toast.error('Please provide a reason for delivery failure');
      return;
    }

    setIsProcessing(true);
    try {
      await markDeliveryFailed(delivery.order_id, failureReason, true);
      toast.success('Delivery marked as failed. Item will be returned to warehouse.');
      onClose();
      // Reset state
      setStep('initiate');
      setFailureReason('');
    } catch (err) {
      toast.error('Failed to mark delivery as failed');
      console.error('Delivery failure error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Complete Delivery
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiXCircle size={24} />
            </button>
          </div>

          {/* Delivery Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 mb-2">
              <FiPackage className="text-blue-600" size={20} />
              <div>
                <p className="font-medium text-gray-900">Order #{delivery.order_id}</p>
                <p className="text-sm text-gray-600">{delivery.customer_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FiClock size={16} />
              <span>Expected: {delivery.estimated_delivery_time}</span>
            </div>
          </div>

          {/* Step: Initiate OTP */}
          {step === 'initiate' && (
            <div className="space-y-4">
              <div className="text-center">
                <FiKey className="mx-auto text-blue-600 mb-3" size={48} />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Ready to deliver?
                </h4>
                <p className="text-gray-600 mb-4">
                  An OTP will be sent to the customer. They will share it with you to confirm delivery.
                </p>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleInitiateOTP}
                  disabled={isProcessing || loading}
                  variant="primary"
                  className="flex-1"
                >
                  {isProcessing ? 'Sending OTP...' : 'Send OTP to Customer'}
                </Button>
                <Button
                  onClick={() => setStep('failed')}
                  variant="outline"
                  className="flex-1"
                >
                  Customer Rejected
                </Button>
              </div>
            </div>
          )}

          {/* Step: Verify OTP */}
          {step === 'verify' && (
            <div className="space-y-4">
              <div className="text-center">
                <FiCheckCircle className="mx-auto text-green-600 mb-3" size={48} />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  OTP Sent Successfully!
                </h4>
                <p className="text-gray-600 mb-4">
                  Ask the customer for the OTP they received and enter it below to complete the delivery.
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  label="Customer OTP"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  className="text-center text-lg tracking-widest"
                />

                <Input
                  label="Delivery Notes (Optional)"
                  type="textarea"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Any additional notes about the delivery..."
                  rows="3"
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button
                    onClick={handleCompleteDelivery}
                    disabled={isProcessing || loading}
                    variant="primary"
                    className="flex-1"
                  >
                    {isProcessing ? 'Completing...' : 'Complete Delivery'}
                  </Button>
                  <Button
                    onClick={() => setStep('failed')}
                    variant="outline"
                    className="flex-1"
                  >
                    Mark Failed
                  </Button>
                </div>

                <Button
                  onClick={() => setStep('initiate')}
                  variant="ghost"
                  className="w-full"
                >
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* Step: Delivery Failed */}
          {step === 'failed' && (
            <div className="space-y-4">
              <div className="text-center">
                <FiXCircle className="mx-auto text-red-600 mb-3" size={48} />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Delivery Failed
                </h4>
                <p className="text-gray-600 mb-4">
                  Please provide a reason for the failed delivery. The item will be returned to the warehouse.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Failure Reason
                  </label>
                  <select
                    value={failureReason}
                    onChange={(e) => setFailureReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select reason...</option>
                    <option value="Customer not available">Customer not available</option>
                    <option value="Customer rejected delivery">Customer rejected delivery</option>
                    <option value="Wrong address">Wrong address</option>
                    <option value="Customer requested cancellation">Customer requested cancellation</option>
                    <option value="Product damaged">Product damaged</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {failureReason === 'Other' && (
                  <Input
                    type="textarea"
                    value={failureReason}
                    onChange={(e) => setFailureReason(e.target.value)}
                    placeholder="Please specify the reason..."
                    rows="3"
                  />
                )}

                <div className="flex space-x-3">
                  <Button
                    onClick={handleMarkFailed}
                    disabled={isProcessing || loading}
                    variant="danger"
                    className="flex-1"
                  >
                    {isProcessing ? 'Processing...' : 'Mark Failed & Return'}
                  </Button>
                  <Button
                    onClick={() => setStep('initiate')}
                    variant="outline"
                    className="flex-1"
                  >
                    Back
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPDeliveryModal;
