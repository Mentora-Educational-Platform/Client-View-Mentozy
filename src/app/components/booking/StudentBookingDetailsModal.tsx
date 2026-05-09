import { useState } from 'react';
import { X, Clock, Video, FileText, CreditCard, CalendarClock, Loader2, ShieldCheck } from 'lucide-react';
import { Booking, markBookingPaidAndConfirm } from '../../../lib/api';
import { toast } from 'sonner';
import { LiveSessionModal } from '../video/LiveSessionModal';

interface StudentBookingDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: Booking | null;
    onBookingUpdated?: (bookingId: string, updates: Partial<Booking>) => void;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

const FALLBACK_SESSION_PRICE_INR = 500;
const FALLBACK_RAZORPAY_KEY = 'rzp_test_SbsDY1EgH8rPZb';

export function StudentBookingDetailsModal({ isOpen, onClose, booking, onBookingUpdated }: StudentBookingDetailsModalProps) {
    const [paying, setPaying] = useState(false);
    const [liveSessionOpen, setLiveSessionOpen] = useState(false);
    if (!isOpen || !booking) return null;

    const mentorName = booking.mentors?.name || 'Mentor';
    const scheduledDate = new Date(booking.scheduled_at);
    const isSessionDay = new Date().toDateString() === scheduledDate.toDateString();
    const amountINR = booking.mentors?.hourly_rate || FALLBACK_SESSION_PRICE_INR;

    const handleEmbeddedPayment = async () => {
        if (paying) return;

        if (!window.Razorpay) {
            toast.error('Payment checkout is unavailable right now. Please refresh and try again.');
            return;
        }

        setPaying(true);
        try {
            const orderRes = await fetch('/api/payments/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: amountINR,
                    currency: 'INR',
                    bookingId: booking.id,
                }),
            });

            const payload = await orderRes.json();
            if (!orderRes.ok || !payload?.order?.id) {
                throw new Error(payload?.error || 'Failed to create payment order.');
            }

            const checkoutKey = payload?.checkout?.key || FALLBACK_RAZORPAY_KEY;

            const rzp = new window.Razorpay({
                key: checkoutKey,
                name: 'Mentozy',
                description: `Mentorship session with ${mentorName}`,
                order_id: payload.order.id,
                amount: payload.order.amount,
                currency: payload.order.currency || 'INR',
                theme: { color: '#f59e0b' },
                modal: {
                    ondismiss: () => setPaying(false),
                },
                handler: async () => {
                    const confirmed = await markBookingPaidAndConfirm(booking.id);
                    if (!confirmed) {
                        toast.error('Payment succeeded, but session confirmation failed. Please contact support.');
                        setPaying(false);
                        return;
                    }

                    onBookingUpdated?.(booking.id, { status: 'confirmed' });
                    toast.success('Payment successful. Your session is now confirmed.');
                    setPaying(false);
                    onClose();
                },
            });

            rzp.on('payment.failed', () => {
                toast.error('Payment failed. Please try again.');
                setPaying(false);
            });

            rzp.open();
        } catch (error) {
            console.error('Embedded booking payment failed:', error);
            toast.error('Could not start payment. Please try again.');
            setPaying(false);
        }
    };

    return (
        <>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>

                    <h2 className="text-xl font-bold mb-1">Session Details</h2>
                    <p className="text-amber-100 text-sm">with <span className="text-white font-semibold">{mentorName}</span></p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Time & Date */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="w-12 h-12 bg-white rounded-xl flex flex-col items-center justify-center font-bold text-gray-900 border border-gray-100 shadow-sm">
                            <span className="text-[10px] text-gray-400 uppercase leading-tight">{scheduledDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                            <span className="text-lg leading-none">{scheduledDate.getDate()}</span>
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">{scheduledDate.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                                <Clock className="w-3.5 h-3.5" />
                                {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-sm">
                        <p className="font-semibold">Automatic split enabled after successful payment.</p>
                        <p className="mt-1">Mentor receives 92% and Mentozy receives 8% through platform settlement.</p>
                    </div>

                    {/* Platform Session Access */}
                    {booking.status === 'confirmed' && (
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Video className="w-3.5 h-3.5" /> Join Session
                            </h3>
                            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 text-sm space-y-3">
                                <p>Your class is confirmed. Join through Mentozy Native WebRTC.</p>
                                {isSessionDay ? (
                                    <button
                                        type="button"
                                        onClick={() => setLiveSessionOpen(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
                                    >
                                        <Video className="w-4 h-4" /> Join Class
                                    </button>
                                ) : (
                                    <p className="text-xs font-medium text-indigo-900/70 flex items-center gap-1.5">
                                        <CalendarClock className="w-3.5 h-3.5" />
                                        Join unlocks on {scheduledDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {booking.status === 'accepted' && (
                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-sm space-y-3">
                            <p>Your mentor accepted this session. Complete payment to unlock your final class confirmation.</p>
                            <button
                                type="button"
                                onClick={handleEmbeddedPayment}
                                disabled={paying}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors disabled:opacity-70"
                            >
                                {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                                Pay ₹{amountINR}
                            </button>
                            <p className="text-xs inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Payment is mandatory before join is enabled.</p>
                        </div>
                    )}

                    {/* Mentor Note */}
                    {booking.mentor_note && (
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5" /> Mentor Note
                            </h3>
                            <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 leading-relaxed">
                                {booking.mentor_note}
                            </div>
                        </div>
                    )}

                    {/* Payment Proof (If visible to student, usually not necessary but user asked for "upload image of payment scanner - for now") 
                        Assuming this is for the student to Pay? Or for the mentor to prove they received it? 
                        
                        Re-reading request: "mentor should add ... upload image of payment scanner - for now, and student get re notified with details"
                        This phrasing "upload image of payment scanner" by the MENTOR is weird. 
                        Usually students upload payment proof.
                        
                        Interpretations:
                        A) Mentor uploads a QR code/Scanner for the Student TO PAY.
                        B) Mentor uploads proof that they received payment? (Unlikely)

                        Given "student get notified with details" and "mentor adds... payment scanner", 
                        Reasonable assumption: Mentor adds their QR code (Scanner) for payment collection if not done automatically.
                        So Student needs to SEE this image to PAY.
                    */}
                    {/* Status Banner */}
                    <div className={`mt-4 py-2 px-4 rounded-lg text-center text-sm font-bold ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                        booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                        }`}>
                        Status: {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </div>
                </div>
            </div>
        </div>
        <LiveSessionModal
            isOpen={liveSessionOpen}
            onClose={() => setLiveSessionOpen(false)}
            participantName={mentorName}
        />
        </>
    );
}
