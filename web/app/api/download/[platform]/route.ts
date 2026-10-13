import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createClient } from "@/lib/supabase/server";
import { DOWNLOADS } from "@/lib/site";

type R2Like = {
  get(key: string): Promise<{ body: ReadableStream; size: number; httpEtag: string } | null>;
};

/** Auth-gated binary download streamed from the R2 bucket binding. */
export async function GET(_req: Request, { params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  if (platform !== "android" && platform !== "windows" && platform !== "neurocraft") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const file = DOWNLOADS[platform];
  const bucket = (getCloudflareContext().env as unknown as { DOWNLOADS?: R2Like }).DOWNLOADS;
  if (!bucket) return NextResponse.json({ error: "Downloads unavailable" }, { status: 503 });

  const object = await bucket.get(file.key);
  if (!object) return NextResponse.json({ error: "File not found" }, { status: 404 });

  return new Response(object.body, {
    headers: {
      "Content-Type": file.type,
      "Content-Length": String(object.size),
      "Content-Disposition": `attachment; filename="${file.filename}"`,
      ETag: object.httpEtag,
      "Cache-Control": "private, no-store",
    },
  });
}
