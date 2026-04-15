import { connectMongoDB } from "@/app/lib/mongodb";
import User from "@/app/model/user";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongoDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email }).select("_id");
    console.log("user: ", user);

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/userExist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
