import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import candidateProfile from "@/lib/auto-apply/candidate_profile.json";

const PROFILE_FILE_PATH = path.join(process.cwd(), "lib", "auto-apply", "candidate_profile.json");

export async function GET() {
  try {
    if (fs.existsSync(PROFILE_FILE_PATH)) {
      const data = fs.readFileSync(PROFILE_FILE_PATH, "utf-8");
      return NextResponse.json({
        success: true,
        profile: JSON.parse(data)
      });
    }
    return NextResponse.json({
      success: true,
      profile: candidateProfile
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      profile: candidateProfile
    });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const updatedProfile = await req.json();
    fs.writeFileSync(PROFILE_FILE_PATH, JSON.stringify(updatedProfile, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      message: "Candidate profile updated successfully!",
      profile: updatedProfile
    });
  } catch (error: any) {
    console.error("Update profile API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update profile." },
      { status: 500 }
    );
  }
}
