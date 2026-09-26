import { NextRequest, NextResponse } from "next/server";
import { startApplierEngine, stopApplierEngine, getApplierStatus } from "@/lib/auto-apply/applierEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, dryRun, platform, customProfile } = body;

    if (action === "stop") {
      stopApplierEngine();
      return NextResponse.json({
        success: true,
        message: "Auto-applier engine stopped.",
        status: getApplierStatus()
      });
    }

    // Start engine in non-blocking background loop
    startApplierEngine({
      dryRun: dryRun !== undefined ? dryRun : false,
      platform: platform || "Both",
      customProfile
    }).catch((err) => {
      console.error("Auto-applier background error:", err);
    });

    return NextResponse.json({
      success: true,
      message: "Auto-applier engine started successfully!",
      status: getApplierStatus()
    });

  } catch (error: any) {
    console.error("Start auto-applier API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to start auto-applier." },
      { status: 500 }
    );
  }
}
