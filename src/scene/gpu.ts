export function hardwareGL(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", {
      failIfMajorPerformanceCaveat: true,
      powerPreference: "high-performance",
    });
    if (!gl) return false;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL) || "") : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    if (!name) return false;
    return !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(name);
  } catch {
    return false;
  }
}
