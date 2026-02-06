import { useState } from 'react';
import { X, Link, Type, CreditCard, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AcceptSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentName: string;
    onConfirm: (meetingLink: string, note: string, paymentLink: string) => Promise<boolean>;
}

export function AcceptSessionModal({ isOpen, onClose, studentName, onConfirm }: AcceptSessionModalProps) {
    const [meetingLink, setMeetingLink] = useState('');
    const [note, setNote] = useState('');
    const [paymentLink, setPaymentLink] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        // Validation
        if (!meetingLink.trim()) {
            toast.error("Please provide a meeting link (Google Meet, Zoom, etc.)");
            return;
        }

        // URL validation for meeting link
        try {
            new URL(meetingLink);
        } catch (_) {
            toast.error("Please enter a valid Meeting URL");
            return;
        }

        setLoading(true);
        try {
            const success = await onConfirm(meetingLink, note, paymentLink);
            if (success) {
                onClose();
                setMeetingLink('');
                setNote('');
                setPaymentLink('');
            }
        } catch (error) {
            console.error("Error in modal submit:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white relative">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full">
                        <X className="w-4 h-4 text-white" />
                    </button>
                    <h2 className="text-xl font-bold mb-1">Accept Session</h2>
                    <p className="text-emerald-100 text-sm">Confirm with <span className="text-white font-semibold">{studentName}</span></p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Meeting Link */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <Link className="h-4 w-4 text-emerald-600" /> Meeting Link <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="url"
                            className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                            placeholder="https://meet.google.com/..."
                            value={meetingLink}
                            onChange={(e) => setMeetingLink(e.target.value)}
                        />
                    </div>

                    {/* Payment Link */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-emerald-600" /> Payment Link / UPI ID
                        </label>
                        <input
                            type="text"
                            className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                            placeholder="upi-id@okicici OR https://razorpay.me/..."
                            value={paymentLink}
                            onChange={(e) => setPaymentLink(e.target.value)}
                        />
                        <p className="mt-1.5 text-xs text-gray-500">Provide a UPI ID or payment link for the student.</p>
                    </div>

                    {/* Note */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <Type className="h-4 w-4 text-emerald-600" /> Note to Student
                        </label>
                        <textarea
                            className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all text-sm min-h-[80px]"
                            placeholder="Looking forward to our session..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                        <button onClick={onClose} className="flex-1 px-4 py-3 bg-gray-50 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-100" disabled={loading}>
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-200 disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Confirm & Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
