import { NextResponse } from "next/server";
import { EscalationAlertService } from "@/src/services/escalations/escalation-alert-service";

export async function POST(req: Request) {
  try {
    console.log('[BehavioralMonitoring] Starting behavioral monitoring process');

    // Run behavioral monitoring for all students
    await EscalationAlertService.runBehavioralMonitoringForAllStudents();

    return NextResponse.json({
      success: true,
      message: "Behavioral monitoring completed successfully"
    });

  } catch (error) {
    console.error('[BehavioralMonitoring] Error in behavioral monitoring:', error);
    
    return NextResponse.json(
      { 
        error: "Failed to run behavioral monitoring",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
