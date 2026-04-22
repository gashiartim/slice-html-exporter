import JSZip from "jszip";

export async function createZipArchive(
  files: { name: string; data: Buffer }[],
) {
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.name, file.data);
  }
  return await zip.generateAsync({ type: "nodebuffer", compression: "STORE" });
}
