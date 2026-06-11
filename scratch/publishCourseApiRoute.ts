import { NextResponse } from 'next/server';
import { publishOrgCourseAction } from './publishCourseAction';

/**
 * Next.js App Router API Route handler: POST /api/publish-course
 * 
 * Securely processes course creation and bulk student auto-enrollment
 * on the backend using the Supabase Service Role key to bypass client RLS blockages.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courseId, courseData, modules, creatorId, status, orgId } = body;

    if (!courseData || !courseData.title) {
      return NextResponse.json(
        { success: false, error: "Missing required course title or payload fields." },
        { status: 400 }
      );
    }

    // Call our secure backend transaction action
    const result = await publishOrgCourseAction(
      {
        title: courseData.title,
        description: courseData.description || courseData.subtitle || '',
        level: courseData.level || 'All Levels',
        duration: courseData.duration || '4 Weeks',
        price: courseData.price || 0,
        image_url: courseData.image_url || null
      },
      modules || [],
      creatorId,
      orgId
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      trackId: result.trackId,
      enrolledCount: result.enrolledCount,
      warning: result.warning
    });

  } catch (err: any) {
    console.error("API Route error in /api/publish-course:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
