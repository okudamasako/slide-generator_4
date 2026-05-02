export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { theme, target, goal, notes, slideCount } = req.body;

  if (!theme || !target || !goal || !slideCount) {
    return res.status(400).json({ error: '入力が不足しています' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'APIキーが設定されていません' });
  }

  const prompt = `以下の条件でプレゼン資料のスライド構成案を作成してください。

テーマ：${theme}
ターゲット：${target}
目的・ゴール：${goal}
伝えたい要点：${notes || 'なし'}
スライド枚数：${slideCount}

出力形式：
・スライドごとに「スライド番号：タイトル」「内容の要点（2〜3行）」を記載
・全体の流れが自然になるよう構成すること
・日本語で出力すること
・Markdownの装飾（**や##など）は一切使わず、プレーンテキストで出力すること`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) return res.status(401).json({ error: 'APIキーが無効です' });
      if (response.status === 429) return res.status(429).json({ error: 'APIの利用上限に達しました' });
      return res.status(500).json({ error: data.error?.message || '生成に失敗しました' });
    }

    const result = data.content?.[0]?.text || '';
    return res.status(200).json({ result });

  } catch (e) {
    return res.status(500).json({ error: 'サーバーエラーが発生しました: ' + e.message });
  }
}
