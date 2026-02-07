import { Suspense } from 'react';
import { TeacherSuccessPage } from '@/components/pages/TeacherSuccessPage';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TeacherSuccessPage />
    </Suspense>
  );
}
