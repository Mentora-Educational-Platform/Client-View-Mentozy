"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Calendar } from '@/components/ui/calendar';
import { X, Clock, Loader2, CheckCircle2, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    mentorName: string;
    mentorImage?: string; // Optional URL or class
    userPlan?: 'Free' | 'Premium' | 'Ultra' | 'Unlimited';
    onConfirm: (date: Date, timeSlot: string) => Promise<boolean>;
}

const TIME_SLOTS = [
    "09:00 AM", "10:00 AM", "11:00 AM",
    "01:00 PM", "02:00 PM", "03:00 PM",
    "04:00 PM", "05:00 PM"
];

export function BookingModal({ isOpen, onClose, mentorName, userPlan = 'Free', onConfirm }: BookingModalProps) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'date' | 'time'>('date');

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (!date || !selectedTime) {
            toast.error("Please select both a date and time.");
            return;
        }

        setLoading(true);
        // Combine date and time (simplified for MVP)
        const bookingDate = new Date(date);
        const [time, period] = selectedTime.split(' ');
        let [hours, minutes] = time.split(':').map(Number);

        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        bookingDate.setHours(hours, minutes, 0, 0);

        const success = await onConfirm(bookingDate, selectedTime);
        setLoading(false);
        if (success) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>

                    <h2 className="text-xl font-bold mb-1">Book Session</h2>
                    <p className="text-gray-300 text-sm">with <span className="text-white font-semibold">{mentorName}</span></p>

                    {/* Steps Indicator */}
                    <div className="flex gap-2 mt-6">
                        <div className={`h-1 flex-1 rounded-full transition-colors ${step === 'date' ? 'bg-amber-500' : 'bg-amber-500'}`}></div>
                        <div className={`h-1 flex-1 rounded-full transition-colors ${step === 'time' ? 'bg-amber-500' : 'bg-gray-700'}`}></div>
                    </div>
                </div>

                <div className="p-6">
                    {step === 'date' ? (
                        <div className="space-y-4">
                            <div className="text-center">
                                <h3 className="font-bold text-gray-900 text-lg mb-1">Select Date</h3>
                                <p className="text-gray-500 text-sm">When would you like to meet?</p>
                            </div>

                            <div className="flex justify-center bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(d) => { if (d) setDate(d); }}
                                    className="rounded-md"
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                />
                            </div>

                            <button
                                onClick={() => setStep('time')}
                                disabled={!date}
                                className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Continue
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold">
                                    {date?.getDate()}
                                </div>
                                <div>
                                    <p className="text-xs text-amber-600 font-bold uppercase tracking-wider">Selected Date</p>
                                    <p className="font-bold text-gray-900">{date?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                </div>
                                <button onClick={() => setStep('date')} className="ml-auto text-xs font-bold text-gray-400 hover:text-gray-600 underline">Change</button>
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" /> Available Times
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {TIME_SLOTS.map(slot => (
                                        <button
                                            key={slot}
                                            onClick={() => setSelectedTime(slot)}
                                            className={`
                                                py-2 px-1 rounded-lg text-sm font-semibold border transition-all
                                                ${selectedTime === slot
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'}
                                            `}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleConfirm}
                                disabled={!selectedTime || loading}
                                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                Confirm Booking
                            </button>

                            {/* Plan Info Details */}
                            <div className="text-center">
                                {userPlan === 'Free' ? (
                                    <p className="text-xs text-gray-500">
                                        Paying per session? <Link href="/plans" className="text-indigo-600 font-bold hover:underline">Get a plan</Link> to save.
                                    </p>
                                ) : (
                                    <p className="text-xs text-indigo-600 font-medium">
                                        <Zap className="w-3 h-3 inline-block mr-1" />
                                        This session will use your <strong>{userPlan}</strong> live minutes.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
