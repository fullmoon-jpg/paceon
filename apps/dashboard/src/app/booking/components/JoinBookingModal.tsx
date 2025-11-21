// src/app/booking/components/JoinBookingModal.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import { X, Calendar, Clock, MapPin, DollarSign, CreditCard } from "lucide-react";
import { format } from "date-fns";

interface BookingEvent {
  id: string | number;
  title: string;
  date: string | Date;
  time: string;
  venueName: string;
  price: number;
  [key: string]: unknown;
}

interface JoinBookingModalProps {
  event: BookingEvent;
  onClose: () => void;
  onConfirm: () => void;
}

type PaymentMethod = 'qris' | 'va' | 'ewallet';

interface PaymentOption {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: string;
}

export default function JoinBookingModal({ 
  event, 
  onClose, 
  onConfirm 
}: JoinBookingModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qris');

  const serviceFee = 10000;
  const totalAmount = useMemo(() => event.price + serviceFee, [event.price, serviceFee]);

  const paymentOptions: PaymentOption[] = useMemo(() => [
    { id: 'qris', label: 'QRIS', description: 'Scan & Pay', icon: 'QR' },
    { id: 'va', label: 'Virtual Account', description: 'BCA, Mandiri, BNI', icon: 'VA' },
    { id: 'ewallet', label: 'E-Wallet', description: 'GoPay, OVO, DANA', icon: 'E' },
  ], []);

  const formattedDate = useMemo(
    () => format(new Date(event.date), 'EEE, MMM dd, yyyy'),
    [event.date]
  );

  const handleConfirmPayment = useCallback(async () => {
    setIsProcessing(true);

    // TODO: Replace with actual payment API call
    setTimeout(() => {
      onConfirm();
      setIsProcessing(false);
    }, 2000);
  }, [onConfirm]);

  const handleClose = useCallback(() => onClose(), [onClose]);

  const handlePaymentMethodChange = useCallback((method: PaymentMethod) => {
    setPaymentMethod(method);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-[#242837] rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-[#3F3E3D] dark:text-white">Confirm Booking</h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-[#F4F4EF] dark:hover:bg-[#2d3548] rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X size={20} className="text-[#3F3E3D] dark:text-gray-400" />
          </button>
        </div>

        {/* Event Summary */}
        <div className="bg-[#F4F4EF] dark:bg-[#2d3548] rounded-lg p-4 mb-6 space-y-3">
          <h4 className="font-bold text-[#3F3E3D] dark:text-white text-sm">{event.title}</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Calendar size={16} className="text-[#FB6F7A]" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Clock size={16} className="text-[#FB6F7A]" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <MapPin size={16} className="text-[#FB6F7A]" />
              <span>{event.venueName}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <h4 className="font-bold text-[#3F3E3D] dark:text-white text-sm mb-3 flex items-center gap-2">
            <CreditCard size={16} className="text-[#FB6F7A]" />
            Payment Method
          </h4>
          
          <div className="space-y-2">
            {paymentOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handlePaymentMethodChange(option.id)}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  paymentMethod === option.id
                    ? 'border-[#FB6F7A] bg-[#FB6F7A]/10'
                    : 'border-gray-200 dark:border-[#3d4459] hover:border-gray-300 dark:hover:border-[#4a5166]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    paymentMethod === option.id ? 'bg-[#FB6F7A]' : 'bg-[#F4F4EF] dark:bg-[#3d4459]'
                  }`}>
                    <span className={`text-xs font-bold ${
                      paymentMethod === option.id ? 'text-white' : 'text-[#3F3E3D] dark:text-gray-400'
                    }`}>{option.icon}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-[#3F3E3D] dark:text-white text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-[#F4F4EF] dark:bg-[#2d3548] rounded-lg p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Entry Fee</span>
            <span className="font-semibold text-[#3F3E3D] dark:text-white">Rp {event.price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Service Fee</span>
            <span className="font-semibold text-[#3F3E3D] dark:text-white">Rp {serviceFee.toLocaleString()}</span>
          </div>
          <div className="border-t border-gray-200 dark:border-[#3d4459] pt-2">
            <div className="flex justify-between">
              <span className="font-bold text-[#3F3E3D] dark:text-white">Total</span>
              <span className="font-bold text-lg text-[#FB6F7A]">
                Rp {totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="flex-1 bg-[#F4F4EF] dark:bg-[#3d4459] text-[#3F3E3D] dark:text-gray-300 py-3 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-[#4a5166] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmPayment}
            disabled={isProcessing}
            className="flex-1 bg-[#21C36E] text-white py-3 rounded-lg font-bold hover:bg-[#1a9d57] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
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

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}