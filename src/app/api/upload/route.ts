import { getCloudinaryCloudName } from "@/lib/services/cloudinary.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const cloudName = getCloudinaryCloudName();
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET?.trim();
    const folder = process.env.CLOUDINARY_FOLDER?.trim();

    if (!cloudName || !uploadPreset) {
        return NextResponse.json({ error: "Cloudinary no configurado" }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
        return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }

    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("upload_preset", uploadPreset);
    if (folder) uploadForm.append("folder", folder);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: uploadForm }
    );

    if (!response.ok) {
        const errorBody = await response.text();
        return NextResponse.json(
            { error: `Error al subir imagen: ${errorBody}` },
            { status: response.status }
        );
    }

    const result = (await response.json()) as { secure_url?: string; url?: string };
    const url = result.secure_url ?? result.url;

    if (!url) {
        return NextResponse.json({ error: "Cloudinary no devolvió URL" }, { status: 500 });
    }

    return NextResponse.json({ url });
}
