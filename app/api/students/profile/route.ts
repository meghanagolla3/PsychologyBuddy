import { NextRequest, NextResponse } from "next/server";
import { StudentController } from "@/src/server/profiles/student/student.controller";

export async function PUT(req: NextRequest) {
  try {
    // Get session from cookie for authentication
    const sessionId = req.cookies.get('sessionId')?.value || 
                    req.headers.get('authorization')?.replace('Bearer ', '');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Find session and user
    const { AuthRepository } = await import("@/src/server/repository/auth.repository");
    const session = await AuthRepository.findSessionBySessionId(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Invalid session" },
        { status: 401 }
      );
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      await AuthRepository.deleteSession(sessionId);
      return NextResponse.json(
        { success: false, message: "Session expired" },
        { status: 401 }
      );
    }

    const user = session.user;
    const formData = await req.formData();
    
    // Extract data from form
    const data = JSON.parse(formData.get('data') as string);
    const photo = formData.get('photo') as File | null;

    // Call controller to update profile
    const result = await StudentController.updateStudentProfile(req, {
      params: { id: user.id },
      body: { data, photo }
    });

    return result;
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
