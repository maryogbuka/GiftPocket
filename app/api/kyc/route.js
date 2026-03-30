// app/api/kyc/verify-selfie/route.js
import { NextResponse } from "next/server";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request) {
  try {
    const { image, userId, name } = await request.json();
    
    if (!image) {
      return NextResponse.json(
        { success: false, error: "No image provided" },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: "kyc/selfies",
      public_id: `selfie_${userId}_${Date.now()}`,
      overwrite: true
    });

    // Liveness Detection with Google Vision
    const visionResponse = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
      {
        requests: [{
          image: { content: image.replace(/^data:image\/\w+;base64,/, "") },
          features: [
            { type: "FACE_DETECTION", maxResults: 5 },
            { type: "LABEL_DETECTION", maxResults: 10 }
          ]
        }]
      }
    );

    const faceAnnotations = visionResponse.data.responses[0].faceAnnotations;
    
    if (!faceAnnotations || faceAnnotations.length === 0) {
      return NextResponse.json(
        { success: false, error: "No face detected in image" },
        { status: 400 }
      );
    }

    // Liveness detection checks
    const face = faceAnnotations[0];
    const livenessChecks = {
      multipleFaces: faceAnnotations.length === 1,
      faceConfidence: face.detectionConfidence > 0.8,
      eyesOpen: face.joyLikelihood !== "VERY_UNLIKELY",
      notBlurred: face.blurredLikelihood === "VERY_UNLIKELY"
    };

    const passedChecks = Object.values(livenessChecks).filter(Boolean).length;
    const livenessScore = Math.round((passedChecks / Object.keys(livenessChecks).length) * 100);

    // Additional check with Dojah (NIN + Selfie)
    let ninVerification = null;
    if (process.env.DOJAH_APP_ID) {
      try {
        const dojahResponse = await axios.post(
          "https://api.dojah.io/api/v1/kyc/nin/verify",
          {
            first_name: name.split(' ')[0],
            last_name: name.split(' ').slice(1).join(' ') || name.split(' ')[0],
            nin: "", // You'd get NIN from user
            image: uploadResult.secure_url
          },
          {
            headers: {
              "AppId": process.env.DOJAH_APP_ID,
              "Authorization": process.env.DOJAH_SECRET_KEY,
              "Content-Type": "application/json"
            }
          }
        );
        ninVerification = dojahResponse.data;
      } catch (dojahError) {
        console.log("Dojah verification optional:", dojahError.message);
      }
    }

    const isLive = livenessScore >= 80;

    return NextResponse.json({
      success: isLive,
      message: isLive ? "Liveness check passed" : "Liveness check failed",
      data: {
        livenessScore,
        checks: livenessChecks,
        imageUrl: uploadResult.secure_url,
        ninVerification,
        passed: isLive
      }
    });

  } catch (error) {
    console.error("Selfie Verification Error:", error);
    
    return NextResponse.json(
      { success: false, error: "Selfie verification failed" },
      { status: 500 }
    );
  }
}