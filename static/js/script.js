async function sendMessage() {
  const input = document.getElementById('input');
  const userInput = input.value.trim();
  if (!userInput) return;

  const chatBox = document.getElementById("chatBox");

  //  顯示使用者輸入
  chatBox.innerHTML += `<div class="user">🙋‍♂️ ${userInput}</div>`;
  input.value = '';

  //  送給 GPT 拿回回覆（後端 Flask API 處理 /ask_gpt）
  const gptRes = await fetch("/ask_gpt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userInput })
  });

  const gptData = await gptRes.json();
  const aiReply = gptData.reply;

  // 顯示 GPT 回覆
  chatBox.innerHTML += `<div class="bot">🤖 ${aiReply}</div>`;

  //  把這個 GPT 回覆再送去 WebVoyager 分析（或進一步任務）
  const voyagerRes = await fetch("/submit_task", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: aiReply }) // 使用 GPT 的回覆作為任務 prompt
  });

  const voyagerData = await voyagerRes.json();

  // 顯示 GPT-4V 的瀏覽任務結果
  chatBox.innerHTML += `<div class="bot">🤖 ${voyagerData.response.replaceAll('\\n', '<br>')}</div>`;

  if (voyagerData.image_path) {
    chatBox.innerHTML += `<img src="${voyagerData.image_path}" style="max-width:100%; margin-top: 1rem;">`;
  }
}
