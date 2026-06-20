import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import Interview from "@/models/Interview";

export async function GET(req: NextRequest) {
  try {
    await connectMongoDB();
    
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Missing email parameter." },
        { status: 400 }
      );
    }

    const user = await (User as any).findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: true, history: [] } // User not registered yet, return empty list
      );
    }

    const history = await (Interview as any).find({
      $or: [
        { userId: user._id },
        { email }
      ]
    })
      .sort({ createdAt: -1 })
      .exec();

    return NextResponse.json({
      success: true,
      history
    });

  } catch (error: any) {
    console.error("Fetch history error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch interview history." },
      { status: 500 }
    );
  }
}
