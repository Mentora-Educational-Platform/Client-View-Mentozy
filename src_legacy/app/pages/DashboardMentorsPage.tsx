import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { MentorGallery } from '../components/mentor/MentorGallery';

export function DashboardMentorsPage() {
    return (
        <DashboardLayout>
            <div className="pb-32 font-sans relative overflow-hidden">
                {/* Decorative Background Blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl animate-blob" />
                    <div className="absolute top-40 right-10 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
                    <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-rose-100/30 rounded-full blur-3xl animate-blob animation-delay-4000" />
                </div>

                <MentorGallery />
            </div>
        </DashboardLayout>
    );
}
