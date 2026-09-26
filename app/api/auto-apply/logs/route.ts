import { NextResponse } from "next/server";
import { getApplierStatus } from "@/lib/auto-apply/applierEngine";
import { getLogs, clearLogs } from "@/lib/auto-apply/logger";

export async function GET() {
  try {
    const status = getApplierStatus();
    const logs = getLogs();

    return NextResponse.json({
      success: true,
      status: {
        ...status,
        logs
      }
    });

  } catch (error: any) {
    console.error("Get logs API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch logs." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    clearLogs();
    return NextResponse.json({
      success: true,
      message: "Application logs cleared."
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to clear logs." },
      { status: 500 }
    );
  }
}
