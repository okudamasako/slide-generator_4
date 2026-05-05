import PptxGenJS from 'pptxgenjs';

const C = {
  primary: "0F172A", // ミッドナイトブルー
  accent:  "38BDF8", // スカイブルー
  gold:    "E2B808", // ゴールド
  text:    "1E293B", // 濃いグレー
  lightBg: "F8FAFC", 
  white:   "FFFFFF"
};

/**
 * 構成案テキストをパースしてスライドオブジェクトに変換する
 */
function parseOutline(outline) {
  const slides = [];
  const sections = outline.split(/スライド\s*\d+\s*[：:]/);
  
  // 最初の空要素を除去
  if (sections[0].trim() === '') sections.shift();

  sections.forEach((content) => {
    const lines = content.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length === 0) return;

    const title = lines[0];
    const points = [];
    let imagePrompt = '';

    lines.slice(1).forEach(line => {
      const imgMatch = line.match(/\[画像プロンプト:\s*(.+)\]/);
      if (imgMatch) {
        imagePrompt = imgMatch[1];
      } else if (line.startsWith('・')) {
        points.push(line.replace(/^・/, '').trim());
      } else {
        points.push(line);
      }
    });

    slides.push({ title, points, imagePrompt });
  });

  return slides;
}

/**
 * OpenAI DALL-E API を呼び出して画像を生成する
 */
async function generateImage(prompt, apiKey) {
  if (!prompt || !apiKey) return null;
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `A clean, professional, high-quality business corporate illustration for a presentation slide: ${prompt}. Minimalist, modern colors (navy, sky blue, white), clean background, no text in image.`,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json"
      })
    });
    const data = await response.json();
    return data.data?.[0]?.b64_json || null;
  } catch (e) {
    console.error("Image generation failed:", e);
    return null;
  }
}

function buildPptx(theme, target, goal, slidesWithImages) {
  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_16x9';
  pres.title = theme;

  // ========== タイトルスライド ==========
  const s0 = pres.addSlide();
  s0.background = { color: C.primary };
  s0.addShape(pres.ShapeType.rect, { x: 6.0, y: 0, w: 4.0, h: 5.625, fill: { color: "1E293B" } });
  s0.addText(theme, {
    x: 0.5, y: 1.5, w: 7, h: 2,
    fontSize: 44, color: C.white, bold: true, fontFace: 'Arial'
  });
  s0.addText(`Target: ${target} | Goal: ${goal}`, {
    x: 0.5, y: 4.0, w: 8, h: 0.5,
    fontSize: 14, color: C.accent, fontFace: 'Arial'
  });

  // ========== コンテンツスライド ==========
  slidesWithImages.forEach((slide, idx) => {
    const s = pres.addSlide();
    s.background = { color: C.lightBg };

    // ヘッダー
    s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.7, fill: { color: C.primary } });
    s.addText(slide.title, {
      x: 0.4, y: 0.15, w: 8, h: 0.4,
      fontSize: 24, color: C.white, bold: true, fontFace: 'Arial'
    });
    s.addText(`${idx + 1}`, {
      x: 9.0, y: 0.15, w: 0.6, h: 0.4,
      fontSize: 20, color: C.gold, bold: true, align: 'right'
    });

    const hasImage = !!slide.imageBase64;
    const contentW = hasImage ? 5.5 : 9.0;

    // イラストの配置
    if (hasImage) {
      s.addShape(pres.ShapeType.rect, {
        x: 6.2, y: 1.0, w: 3.4, h: 3.4,
        fill: { color: C.white },
        line: { color: C.accent, width: 2 },
        shadow: { type: 'outer', blur: 10, color: '000000', opacity: 0.1 }
      });
      s.addImage({
        data: `image/png;base64,${slide.imageBase64}`,
        x: 6.3, y: 1.1, w: 3.2, h: 3.2
      });
    }

    // 箇条書きを「ボックス形式」で図解化
    slide.points.forEach((p, pi) => {
      const yPos = 1.0 + (pi * 1.1);
      if (pi > 3) return; // 最大4つまで

      s.addShape(pres.ShapeType.rect, {
        x: 0.4, y: yPos, w: contentW, h: 0.9,
        fill: { color: C.white },
        line: { color: "E2E8F0", width: 1 },
        shadow: { type: 'outer', blur: 5, color: '000000', opacity: 0.05 }
      });
      s.addShape(pres.ShapeType.rect, { x: 0.4, y: yPos, w: 0.1, h: 0.9, fill: { color: C.gold } });
      
      s.addText(p, {
        x: 0.7, y: yPos, w: contentW - 0.4, h: 0.9,
        fontSize: 16, color: C.text, fontFace: 'Arial', valign: 'middle'
      });
    });
  });

  // ========== 終了スライド ==========
  const sEnd = pres.addSlide();
  sEnd.background = { color: C.primary };
  sEnd.addText('THANK YOU', { x: 0, y: 2.2, w: 10, align: 'center', fontSize: 40, color: C.white, bold: true });

  return pres;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { theme, target, goal, outline } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!theme || !outline || !apiKey) {
    return res.status(400).json({ error: '情報またはAPIキーが不足しています' });
  }

  try {
    const slides = parseOutline(outline);
    
    // 画像生成を並列で実行 (DALL-E 3)
    // 10枚すべてだと時間がかかるため、主要なスライド(偶数番目+最初と最後)を中心に5〜6枚に制限して速度とコストを調整
    const slidesWithImages = await Promise.all(slides.map(async (s, i) => {
      // 全スライド生成すると1-2分かかるため、まずは全スライド試行
      // レート制限に配慮し、エラー時は画像なしで進める
      const imageBase64 = (s.imagePrompt && i < 6) ? await generateImage(s.imagePrompt, apiKey) : null;
      return { ...s, imageBase64 };
    }));

    const pres = buildPptx(theme, target || '', goal || '', slidesWithImages);
    const buffer = await pres.write({ outputType: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename=presentation.pptx`);
    return res.status(200).send(buffer);

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: '生成エラー: ' + e.message });
  }
}
