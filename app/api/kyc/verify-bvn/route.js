// app/api/kyc/verify-bvn/route.js - DOJAH VERSION
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request) {
  try {
    const body = await request.json();
    const { bvn, name, dateOfBirth } = body;
    
    console.log("BVN Verification Request:", { 
      bvn: bvn ? `${bvn.substring(0, 3)}...${bvn.substring(8)}` : "missing"
    });
    
    // Validate BVN
    if (!bvn) {
      return NextResponse.json(
        { success: false, error: "BVN is required" },
        { status: 400 }
      );
    }
    
    if (!/^\d{11}$/.test(bvn)) {
      return NextResponse.json(
        { success: false, error: "Invalid BVN format. Must be exactly 11 digits." },
        { status: 400 }
      );
    }

    // Check if Dojah keys exist
    if (!process.env.DOJAH_APP_ID || !process.env.DOJAH_SECRET_KEY) {
      console.error("Dojah keys not configured");
      return NextResponse.json(
        { 
          success: false, 
          error: "Verification service temporarily unavailable"
        },
        { status: 500 }
      );
    }

    // Dojah BVN Verification
    const response = await axios.post(
      "https://api.dojah.io/api/v1/kyc/bvn",
      { bvn },
      {
        headers: {
          "AppId": process.env.DOJAH_APP_ID,
          "Authorization": process.env.DOJAH_SECRET_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Dojah BVN Response received");

    const bvnData = response.data.entity || response.data;
    
    if (!bvnData) {
      return NextResponse.json(
        { success: false, error: "No data returned from BVN verification" },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "BVN verified successfully",
      data: {
        firstName: bvnData.first_name,
        lastName: bvnData.last_name,
        phone: bvnData.phone_number,
        dateOfBirth: bvnData.date_of_birth,
        gender: bvnData.gender,
        photo: bvnData.photo
      }
    });

  } catch (error) {
    console.error("BVN Verification Error:", error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid BVN or BVN not found"
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: "BVN verification failed"
      },
      { status: 500 }
    );
  }
}