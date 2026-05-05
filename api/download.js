import PptxGenJS from 'pptxgenjs';

const C = {
  primary: "0F172A", // ミッドナイトブルー（信頼感）
  accent:  "38BDF8", // スカイブルー（先進性）
  gold:    "E2B808", // ゴールド（高級感）
  text:    "1E293B", // 濃いグレー（可読性）
  lightBg: "F8FAFC", // 薄いグレー背景
  white:   "FFFFFF"
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

  // ========== タイトルスライド (プレミアム) ==========
  const s0 = pres.addSlide();
  s0.background = { color: C.primary };

  // 背景のアクセント図形
  s0.addShape(pres.ShapeType.rect, { x: 6.5, y: 0, w: 3.5, h: 5.625, fill: { color: "1E293B" } });
  s0.addShape(pres.ShapeType.triangle, { x: 6.0, y: 1.5, w: 1.0, h: 1.0, fill: { color: C.gold }, flipH: true, rotate: 45 });

  s0.addText('STRATEGIC PROPOSAL', {
    x: 0.5, y: 0.8, w: 6, h: 0.4,
    fontSize: 12, color: C.accent, charSpacing: 4, bold: true,
    fontFace: 'Arial', margin: 0
  });

  s0.addText(theme, {
    x: 0.5, y: 1.3, w: 7.5, h: 2.2,
    fontSize: 42, color: C.white, bold: true,
    fontFace: 'Arial', margin: 0,
    animate: { type: 'fade', delay: 300 }
  });

  s0.addShape(pres.ShapeType.rect, { x: 0.5, y: 3.6, w: 1.2, h: 0.05, fill: { color: C.gold } });

  s0.addText(`Target: ${target}\nGoal: ${goal}`, {
    x: 0.5, y: 3.9, w: 6, h: 1.2,
    fontSize: 14, color: "94A3B8",
    fontFace: 'Arial', margin: 0,
    animate: { type: 'slide', direction: 'l', delay: 800 }
  });

  // ========== コンテンツスライド (プレミアム) ==========
  slides.forEach((slide, idx) => {
    const s = pres.addSlide();
    s.background = { color: C.lightBg };

    // ヘッダーバーのデザイン
    s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.8, fill: { color: C.primary } });
    s.addShape(pres.ShapeType.rect, { x: 0, y: 0.8, w: 10, h: 0.04, fill: { color: C.gold } });

    // スライド番号
    s.addText(`${String(idx + 1).padStart(2, '0')}`, {
      x: 8.8, y: 0.2, w: 1, h: 0.4,
      fontSize: 18, color: C.accent, bold: true, align: 'right',
      fontFace: 'Arial'
    });

    // スライドタイトル
    s.addText(slide.title, {
      x: 0.4, y: 0.15, w: 8, h: 0.5,
      fontSize: 24, color: C.white, bold: true,
      fontFace: 'Arial',
      animate: { type: 'fade', delay: 200 }
    });

    // コンテンツエリア
    if (slide.points.length > 0) {
      // メインカード
      s.addShape(pres.ShapeType.rect, {
        x: 0.5, y: 1.2, w: 9.0, h: 4.0,
        fill: { color: C.white },
        line: { color: "E2E8F0", width: 1 },
        shadow: { type: 'outer', blur: 15, offset: 5, angle: 90, color: '000000', opacity: 0.05 }
      });

      // 左側のアクセントライン
      s.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.2, w: 0.1, h: 4.0, fill: { color: C.primary } });

      // 箇条書き（アニメーション付き）
      slide.points.forEach((p, pi) => {
        const yPos = 1.5 + (pi * 0.7);
        // 行番号アイコン風
        s.addShape(pres.ShapeType.rect, { x: 0.85, y: yPos + 0.1, w: 0.08, h: 0.08, fill: { color: C.gold }, rotate: 45 });
        
        s.addText(p, {
          x: 1.1, y: yPos, w: 8.2, h: 0.6,
          fontSize: 18, color: C.text,
          fontFace: 'Arial',
          valign: 'top',
          animate: { type: 'slide', direction: 'l', delay: 400 + (pi * 150) }
        });
      });
    }

    // フッターの装飾
    s.addText('© 2026 NEXT GEN AI SOLUTIONS | CONFIDENTIAL', {
      x: 0.5, y: 5.3, w: 9, h: 0.2,
      fontSize: 8, color: "94A3B8", align: 'center', charSpacing: 2
    });
  });

  // ========== まとめスライド (プレミアム) ==========
  const sEnd = pres.addSlide();
  sEnd.background = { color: C.primary };

  sEnd.addShape(pres.ShapeType.rect, { x: 0, y: 2.2, w: 10, h: 1.2, fill: { color: "1E293B" } });
  sEnd.addShape(pres.ShapeType.rect, { x: 0, y: 2.2, w: 10, h: 0.02, fill: { color: C.gold } });
  sEnd.addShape(pres.ShapeType.rect, { x: 0, y: 3.4, w: 10, h: 0.02, fill: { color: C.gold } });

  sEnd.addText('THANK YOU FOR YOUR ATTENTION', {
    x: 0, y: 1.5, w: 10, h: 0.4,
    fontSize: 14, color: C.accent, align: 'center', charSpacing: 6, bold: true
  });

  sEnd.addText('ご清聴ありがとうございました', {
    x: 0, y: 2.4, w: 10, h: 0.8,
    fontSize: 32, color: C.white, bold: true, align: 'center',
    fontFace: 'Arial'
  });

  sEnd.addText('Contact: Strategic Solutions Team', {
    x: 0, y: 4.2, w: 10, h: 0.4,
    fontSize: 12, color: "94A3B8", align: 'center'
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
