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

  // 環境変数からOpenAIのAPIキーを取得
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAIのAPIキー(OPENAI_API_KEY)が設定されていません' });
  }

  // GPTに渡すシステムプロンプト
  const prompt = `以下の原稿テキストを元に、10枚構成のプレゼン資料を作成してください。
出力は以下のJSONフォーマットのみとし、Markdownコードブロックや他の説明テキストは一切含めないでください。

【原稿テキスト】
${sourceText}

【出力JSONフォーマット】
{
  "theme": "プレゼンのメインテーマ（タイトル）",
  "target": "想定されるターゲット層",
  "goal": "プレゼンの目的",
  "outline": "スライド 1：〇〇\\n・要点1\\n・要点2\\n\\nスライド 2：〇〇\\n・要点1\\n..."
}

【作成条件】
・必ず10枚構成のスライドにすること
・スライドごとに「スライド [数字]：[タイトル]」とし、その下に「・[要点]」を2〜4行記載すること
・Markdownの装飾は使わずプレーンテキストにすること`;

  try {
    // OpenAI APIを呼び出す
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // 高速・高精度・安価な最新モデル
        messages: [
          { role: 'system', content: 'あなたは優秀なプレゼン構成案作成のアシスタントです。必ず指定されたJSONフォーマットのみを返却してください。' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }, // JSON出力を強制
        temperature: 0.7
      })
    });

    const data = await response.json();

    // エラーハンドリング
    if (!response.ok) {
      const errorMsg = data.error?.message || 'OpenAI APIでエラーが発生しました';
      return res.status(response.status).json({ error: `OpenAIエラー: ${errorMsg}` });
    }

    // AIの返答（JSON文字列）を取得
    const result = data.choices[0].message.content;
    
    // そのままフロントエンドに返す
    return res.status(200).json({ result });

  } catch (e) {
    return res.status(500).json({ error: 'サーバーエラーが発生しました: ' + e.message });
  }
}
