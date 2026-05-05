export default async function handler(req, res) {
  // POSTメソッド以外は許可しない
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // リクエストボディから原稿テキストを取得
  const { sourceText } = req.body;

  // 原稿テキストが空の場合はエラーを返す
  if (!sourceText) {
    return res.status(400).json({ error: '原稿テキストが入力されていません' });
  }

  // 環境変数からAPIキーを取得
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'APIキーが設定されていません' });
  }

  // Claudeに渡すシステムプロンプト
  // 初心者にも分かりやすいように、必ずJSONフォーマットで10枚構成のスライドを作るよう指示しています
  const prompt = `以下の原稿テキストを元に、10枚構成のプレゼン資料を作成してください。
出力は以下のJSONフォーマットのみとし、Markdownコードブロックや他のテキストは一切含めないでください。

【原稿テキスト】
${sourceText}

【出力JSONフォーマット】
{
  "theme": "プレゼンのメインテーマ（全体を総括するタイトル）",
  "target": "想定されるターゲット層（例：30代の経営者など）",
  "goal": "プレゼンの目的（例：導入の意思決定を促すなど）",
  "outline": "スライド 1：〇〇\\n・要点1\\n・要点2\\n\\nスライド 2：〇〇\\n・要点1\\n..."
}

【outlineフィールドの作成条件】
・必ず10枚構成のスライドにすること
・スライドごとに「スライド [数字]：[タイトル]」とし、その下に「・[要点]」を2〜4行記載すること
・Markdownの装飾（**や##など）は使わずプレーンテキストにすること`;

  try {
    // Anthropic (Claude) APIを呼び出す
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620', // 互換性の高いSonnet 3.5を指定
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    // APIエラーのハンドリング
    if (!response.ok) {
      if (response.status === 401) return res.status(401).json({ error: 'APIキーが無効です' });
      if (response.status === 429) return res.status(429).json({ error: 'APIの利用上限に達しました' });
      return res.status(500).json({ error: data.error?.message || '生成に失敗しました' });
    }

    // AIの返答を取得
    const result = data.content?.[0]?.text || '';
    
    // JSON文字列としてフロントエンドに返す
    return res.status(200).json({ result });

  } catch (e) {
    // ネットワークエラー等のハンドリング
    return res.status(500).json({ error: 'サーバーエラーが発生しました: ' + e.message });
  }
}
