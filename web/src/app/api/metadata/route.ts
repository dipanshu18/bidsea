import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "@/utils/config";

export async function POST(request: NextRequest) {
  try {
    const { imgUrl, name, description, price } = await request.json();

    const { cid } = await pinata.upload.public.json({
      imgUrl,
      name,
      description,
      price,
    });
    const url = await pinata.gateways.public.convert(cid);
    return NextResponse.json(url, { status: 201 });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
