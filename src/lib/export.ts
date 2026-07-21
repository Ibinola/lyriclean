export function exportEasyWorship(slides: string[], title = "Song"): string {
  const slideXml = slides
    .map((slide) => `    <Slide>\n      <Lines>${escapeXml(slide)}</Lines>\n    </Slide>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<EWSong>
  <Title>${escapeXml(title)}</Title>
  ${slideXml}
</EWSong>`;
}

export function exportProPresenter(slides: string[]): string {
  return slides.map((slide) => `[Slide]\n${slide}`).join("\n\n");
}

export async function exportPowerPoint(slides: string[], title = "Song"): Promise<void> {
  const pptxgen = (await import("pptxgenjs")).default;
  const pres = new pptxgen();
  pres.defineLayout({ name: "CUSTOM", width: 10, height: 5.625 });
  pres.layout = "CUSTOM";

  for (const slide of slides) {
    const lines = slide.split("\n");
    const slideObj = pres.addSlide();
    slideObj.background = { color: "1a1a2e" };

    slideObj.addText(lines.join("\n"), {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 4.625,
      fontSize: 36,
      color: "FFFFFF",
      fontFace: "Arial",
      lineSpacing: 48,
      align: "center",
      valign: "middle",
      wrap: true,
    });
  }

  await pres.writeFile({ fileName: `${title}.pptx` });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
