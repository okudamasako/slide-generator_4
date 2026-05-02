import PptxGenJS from 'pptxgenjs';

const C = {
  navy:    "1E2761",
  accent:  "4FC3F7",
  green:   "00897B",
  red:     "EF5350",
  white:   "FFFFFF",
  lightBg: "F0F4FF",
  darkBg:  "0D1B4B",
  gray:    "64748B",
  iceBlue: "CADCFC",
};

function parseOutline(outline) {
  const slides = [];
  const lines = outline.split('\n').filter(l => l.trim());
  let current = null;

  for (const line of lines) {
    const titleMatch = line.match(/^スライド\s*(\d+)\s*[：:]\s*(.+)/);
    if (titleMatch) {
      if (current) slides.push(current);
      current = { title: titleMatch[2].trim(), points: [] };
    } else if (current && line.trim().startsWith('・')) {
      current.points.push(line.trim().replace(/^・/, '').trim());
    } else if (current && line.trim()) {
      current.points.push(line.trim());
    }
  }
  if (current) slides.push(current);
  return slides;
}

function buildPptx(theme, target, goal, slides) {
  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_16x9';
  pres.title = theme;

  // ========== タイトルスライド ==========
  const s0 = pres.addSlide();
  s0.background = { color: C.darkBg };

  s0.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 0.18, h: 5.625,
    fill: { color: C.accent }
  });
  s0.addText('AI SLIDE GENERATOR', {
    x: 0.5, y: 0.8, w: 9, h: 0.4,
    fontSize: 10, color: C.iceBlue, charSpacing: 6,
    fontFace: 'Arial', margin: 0
  });
  s0.addText(theme, {
    x: 0.5, y: 1.4, w: 6.5, h: 2.0,
    fontSize: 36, color: C.white, bold: true,
    fontFace: 'Arial', margin: 0
  });
  s0.addText(`対象：${target}　／　目的：${goal}`, {
    x: 0.5, y: 3.6, w: 9, h: 0.5,
    fontSize: 14, color: C.iceBlue,
    fontFace: 'Arial', margin: 0
  });

  // ========== コンテンツスライド ==========
  slides.forEach((slide, idx) => {
    const s = pres.addSlide();
    s.background = { color: C.lightBg };

    // ヘッダーバー
    s.addShape(pres.ShapeType.rect, {
      x: 0, y: 0, w: 10, h: 1.0,
      fill: { color: C.navy }
    });
    s.addText(`${idx + 1} / ${slides.length}`, {
      x: 0.4, y: 0.05, w: 2, h: 0.35,
      fontSize: 10, color: C.iceBlue, charSpacing: 4,
      fontFace: 'Arial', margin: 0
    });
    s.addText(slide.title, {
      x: 0.4, y: 0.35, w: 9.2, h: 0.58,
      fontSize: 22, color: C.white, bold: true,
      fontFace: 'Arial', margin: 0
    });

    // コンテンツエリア
    if (slide.points.length > 0) {
      const cardH = Math.min(3.8, 0.7 * slide.points.length + 0.8);
      s.addShape(pres.ShapeType.rect, {
        x: 0.4, y: 1.2, w: 9.2, h: cardH,
        fill: { color: C.white },
        shadow: { type: 'outer', blur: 8, offset: 2, angle: 135, color: '000000', opacity: 0.08 }
      });
      s.addShape(pres.ShapeType.rect, {
        x: 0.4, y: 1.2, w: 0.12, h: cardH,
        fill: { color: C.accent }
      });

      const textItems = slide.points.map((p, pi) => ({
        text: `・${p}`,
        options: {
          breakLine: pi < slide.points.length - 1,
          fontSize: 15,
          color: '1A1A1A',
          fontFace: 'Arial',
        }
      }));
      s.addText(textItems, {
        x: 0.7, y: 1.3, w: 8.8, h: cardH - 0.2,
        valign: 'middle', margin: 0.15,
        paraSpaceAfter: 8
      });
    }
  });

  // ========== まとめスライド ==========
  const sEnd = pres.addSlide();
  sEnd.background = { color: C.darkBg };
  sEnd.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 0.18, h: 5.625,
    fill: { color: C.green }
  });
  sEnd.addText('THANK YOU', {
    x: 0.5, y: 0.8, w: 9, h: 0.4,
    fontSize: 10, color: C.iceBlue, charSpacing: 8,
    fontFace: 'Arial', margin: 0
  });
  sEnd.addText(theme, {
    x: 0.5, y: 1.4, w: 9, h: 1.8,
    fontSize: 32, color: C.white, bold: true,
    fontFace: 'Arial', margin: 0
  });
  sEnd.addText('ご質問・お問い合わせはお気軽にどうぞ。', {
    x: 0.5, y: 3.3, w: 9, h: 0.6,
    fontSize: 15, color: C.iceBlue,
    fontFace: 'Arial', margin: 0
  });

  return pres;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { theme, target, goal, outline } = req.body;

  if (!theme || !outline) {
    return res.status(400).json({ error: '必要な情報が不足しています' });
  }

  try {
    const slides = parseOutline(outline);
    if (slides.length === 0) {
      return res.status(400).json({ error: 'スライド構成の解析に失敗しました' });
    }

    const pres = buildPptx(theme, target || '', goal || '', slides);
    const buffer = await pres.write({ outputType: 'nodebuffer' });

    const filename = encodeURIComponent(`${theme}_スライド.pptx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${filename}`);
    res.setHeader('Content-Length', buffer.length);

    return res.status(200).send(buffer);

  } catch (e) {
    return res.status(500).json({ error: 'ファイル生成に失敗しました: ' + e.message });
  }
}
