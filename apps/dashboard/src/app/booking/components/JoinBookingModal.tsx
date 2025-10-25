// src/app/booking/components/JoinBookingModal.tsx
"use client";

import { useState } from "react";
import { X, Calendar, Clock, MapPin, DollarSign, CreditCard } from "lucide-react";
import { format } from "date-fns";

interface JoinBookingModalProps {
  event: any;
  onClose: () => void;
  onConfirm: () => void;
}

export default function JoinBookingModal({ 
  event, 
  onClose, 
  onConfirm 
}: JoinBookingModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'va' | 'ewallet'>('qris');

  const serviceFee = 10000;
  const totalAmount = event.price + serviceFee;

  const handleConfirmPayment = async () => {
    setIsProcessing(true);

    // TODO: Replace with actual payment API call
    setTimeout(() => {
      onConfirm();
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Confirm Booking</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Event Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
          <h4 className="font-bold text-gray-800 text-sm">{event.title}</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={16} className="text-[#15b392]" />
              <span>{format(new Date(event.date), 'EEE, MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={16} className="text-[#15b392]" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={16} className="text-[#15b392]" />
              <span>{event.venueName}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <CreditCard size={16} className="text-[#15b392]" />
            Payment Method
          </h4>
          
          <div className="space-y-2">
            <button
              onClick={() => setPaymentMethod('qris')}
              className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                paymentMethod === 'qris'
                  ? 'border-[#15b392] bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  paymentMethod === 'qris' ? 'bg-[#15b392]' : 'bg-gray-100'
                }`}>
                  <span className={`text-xs font-bold ${
                    paymentMethod === 'qris' ? 'text-white' : 'text-gray-600'
                  }`}>QR</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">QRIS</div>
                  <div className="text-xs text-gray-500">Scan & Pay</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod('va')}
              className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                paymentMethod === 'va'
                  ? 'border-[#15b392] bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  paymentMethod === 'va' ? 'bg-[#15b392]' : 'bg-gray-100'
                }`}>
                  <span className={`text-xs font-bold ${
                    paymentMethod === 'va' ? 'text-white' : 'text-gray-600'
                  }`}>VA</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">Virtual Account</div>
                  <div className="text-xs text-gray-500">BCA, Mandiri, BNI</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod('ewallet')}
              className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                paymentMethod === 'ewallet'
                  ? 'border-[#15b392] bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  paymentMethod === 'ewallet' ? 'bg-[#15b392]' : 'bg-gray-100'
                }`}>
                  <span className={`text-xs font-bold ${
                    paymentMethod === 'ewallet' ? 'text-white' : 'text-gray-600'
                  }`}>E</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">E-Wallet</div>
                  <div className="text-xs text-gray-500">GoPay, OVO, DANA</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Entry Fee</span>
            <span className="font-semibold text-gray-800">Rp {event.price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Service Fee</span>
            <span className="font-semibold text-gray-800">Rp {serviceFee.toLocaleString()}</span>
          </div>
          <div className="border-t border-gray-200 pt-2">
            <div className="flex justify-between">
              <span className="font-bold text-gray-800">Total</span>
              <span className="font-bold text-lg text-[#15b392]">
                Rp {totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmPayment}
            disabled={isProcessing}
            className="flex-1 bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              'Processing...'
            ) : (
              <>
                <DollarSign size={18} />
                Pay Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
