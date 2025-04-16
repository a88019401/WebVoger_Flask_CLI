# 🛠️ WebVoyager + Flask 開發者指南

📅 最後更新：2025/4/17  
👨‍💻 負責人：Jimmy  
> （這次添加得太多了，我就不附上程式碼了）

---

## 🔧 專案說明

本專案結合了 `Selenium + OpenAI GPT-4V + Flask + JS 前端`，  
實作一個 **仿 ChatGPT 對話框 + 任務型瀏覽 AI 助手**。  

使用者可在對話介面輸入英文學習任務（如查單字、找例句、學文法），  
GPT 回答後自動串接 WebVoyager 機制，進行進一步搜尋與分析。

---

## 🧩 系統架構與流程說明

### 使用者流程

使用者輸入問題 →GPT 回覆內容（/ask_gpt）→該回覆當作任務經過第二次AI思考後作為 prompt 送出 →WebVoyager 以 Selenium 模擬搜尋並擷取畫面 →GPT-4V 分析畫面，回傳新回答與操作 →顯示結果與圖像。


### 技術堆疊

- **Flask**：API 路由處理（`/ask_gpt`, `/submit_task`）  
- **Selenium WebDriver**：模擬瀏覽器互動行為（點擊、輸入、滾動）  
- **OpenAI GPT-4 Vision**：分析 screenshot 並提供具體操作指令  
- **HTML + JS (script.js)**：前端對話介面與 fetch 非同步任務串接  
- **多輪任務流程與畫面快照**：自動儲存為 `screenshot{編號}.png`，供 AI 逐步觀察  

---

## 💡 核心功能實作新增

| 功能名稱               | 說明 |
|------------------------|------|
| `ask_gpt`              | 將使用者問題送至 GPT 模型，取得自然語言回覆。 |
| `submit_task`          | 將 GPT 回覆作為 prompt，送入 WebVoyager 進行模擬網頁操作任務。 |
| `run_single_task()`    | 依據 GPT 回覆內容，自動搜尋、擷取、分析畫面並回傳結果。 |
| 多圖任務支援           | 每輪操作皆擷取畫面為 `screenshot{it}.png`，AI 可逐步觀察。 |
| CLI + Flask 雙模式支援 | 使用 `if 'flask' in sys.argv:` 智慧切換 CLI / Web UI 模式。 |

---

## ⚠️ 開發過程中遇到的問題與解法

### 🔸 UI 中的 fetch 未正確包裝成 prompt 對應格式

- **問題**：AI 回覆無法被 WebVoyager 正確解析與執行  
- **解法**：補上 `prompt: aiReply` 作為 POST 請求 body，成功閉環任務驅動流程  

---

### 🔸 Flask + CLI 同時維運問題

- **問題**：指令模式與 Flask UI 共用同一份程式，導致執行衝突  
- **解法**：使用 `if 'flask' in sys.argv:` 判斷執行模式，CLI 與 UI 可以共存  

---

### 🔸 非同步流程設計困難（使用者對話 → GPT → WebVoyager）

- **問題**：
  - `fetch()` 非同步調用順序不明確  
  - `async/await` 結構與錯誤處理不直觀  
  - JSON 結果需拆解兩層才能抓到 `image_path` 與 `response`  
- **解法**：JS 中分兩階段 API 請求，並對回傳做明確判斷與錯誤提示  

---

### 🔸 Flask 模式下 Selenium 無法觸發 click/type/scroll

- **問題**：AI 回傳操作指令正確，但 Selenium 無法執行  
- **解法**：
  - 加入 `driver_task.switch_to.window(...)` 切換控制視窗  
  - 檢查 label 與元素對應  
  - 加入 log 記錄，成功觸發所有操作  

---

### 🔸 `exec_action_type` 判斷失誤

- **問題**：部分元素無法輸入文字，AI 預測錯誤或元素類型錯誤  
- **解法**：加上 `outerHTML` 輸出除錯，確認是否為 `<textarea>` 或可輸入元素  

---

### 🔸 AI 一直回傳 `screenshot1.png`

- **問題**：每輪迭代都覆蓋 screenshot 檔案  
- **解法**：改為 `screenshot{it}.png` 並正確指定 `it` 為迴圈結尾次數  

---

## 📁 專案結構建議


WebVoyager_Enhanced/
│
├── templates/              # HTML 模板（index.html）
├── static/js/              # 前端邏輯（script.js）
├── data/                   # 任務檔案 JSONL
├── results/                # 擷取畫面輸出
├── run.py                  # CLI 與 Flask 主邏輯整合
├── .env                    # API 設定檔
├── README.md               # 專案說明文件
├── DEVELOPER_GUIDE.md      # 開發者指南（本文件）

---

## ✅ 執行方式

### 啟動 Web UI 模式（Flask）：

python run.py flask

### 使用 CLI 模式：
python run.py






# WebVoyager 改動說明 2025/3/14


## 📄 **1. 主要改動概述**


- 使用 `.env` 檔案來設定 `OPENAI_API_KEY`、`OPENAI_API_MODEL` 和 `TEST_FILE`，簡化啟動流程。
- 互動模式改為動態新增任務，並支援任務確認與刪除，避免不小心執行錯誤任務。
- 在程式啟動時，自動清空 `.jsonl`，確保每次執行都是新的任務流程。

---

## ⚙️ **2. 如何設定環境變數 (`.env` 檔案)**

請在專案根目錄下建立 `.env` 檔案，並加入以下內容：

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_API_MODEL=gpt-4-vision-preview
TEST_FILE=data/tasks_test.jsonl
```

- **`OPENAI_API_KEY`**：您的 OpenAI API 金鑰。
- **`OPENAI_API_MODEL`**：預設使用 `gpt-4-vision-preview`，可依需求修改。
- **`TEST_FILE`**：任務資料檔案位置。

---

## 🚀 **3. 主要程式碼改動**

### **(1) 自動載入 `.env`**
```python
from dotenv import load_dotenv
import os
import argparse

# 自動載入 .env 檔案
load_dotenv()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--test_file', type=str, default=os.getenv("TEST_FILE"))
    parser.add_argument('--api_key', type=str, default=os.getenv("OPENAI_API_KEY"))
    parser.add_argument('--api_model', type=str, default=os.getenv("OPENAI_API_MODEL", "gpt-4-vision-preview"))
    parser.add_argument('--max_iter', type=int, default=5)
    args = parser.parse_args()
```

---

### **(2) 啟動時清空 `.jsonl` 檔案**
```python
TASK_FILE = os.getenv("TEST_FILE", "data/tasks_test.jsonl")

def clear_task_file():
    '''清空 .jsonl 檔案'''
    with open(TASK_FILE, 'w', encoding='utf-8') as f:
        pass
    print(f"🗑️ 任務檔案已清空：{TASK_FILE}")
```

---

### **(3) 新增任務，支援確認或刪除**
```python
def add_task():
    """動態新增學習任務"""
    while True:
        print("📝 你可以選擇以下學習任務類型：")
        print("1️⃣ 查單字")
        print("2️⃣ 找相關影片")
        print("3️⃣ 問文法問題")

        choice = input("請輸入選項 (1/2/3)：")

        if choice == '1':
            word = input("請輸入你想查的英文單字：")
            task = {
                "web_name": "英語學習助手",
                "id": "word_lookup",
                "ques": f"請幫我查 '{word}' 的意思，並給我一個例句。",
                "web": f"https://tw.dictionary.search.yahoo.com/search?p={word}"
            }
        elif choice == '2':
            topic = input("請輸入你想閱讀的主題 (e.g., 環保、科技、旅遊)：")
            task = {
                "web_name": "英語相關影片",
                "id": "video_suggestion",
                "ques": f"請推薦一篇與 '{topic}' 相關的英文刊物。",
                "web": f"https://tw.voicetube.com/channels/news-and-current-affairs"
            }
        elif choice == '3':
            grammar = input("請輸入你想學的文法概念 (e.g., 現在完成式、被動語態)：")
            task = {
                "web_name": "文法小老師",
                "id": "grammar_help",
                "ques": f"請找搜尋出 '{grammar}'，點選到文法頁面。",
                "web": "https://www.ehanlin.com.tw/app/keyword/%E5%9C%8B%E4%B8%AD/%E8%8B%B1%E8%AA%9E/%E5%88%97%E8%A1%A8.html"
            }
        else:
            print("❌ 無效選項，請重新輸入。")
            continue

        # 顯示預覽
        print("\n🔍 預覽任務內容：")
        print(json.dumps(task, ensure_ascii=False, indent=2))

        confirm = input("✅ 確認任務？ (y=確認, r=重新輸入, c=取消新增)：").lower()

        if confirm == 'y':
            with open(TASK_FILE, 'a', encoding='utf-8') as f:
                json.dump(task, f, ensure_ascii=False)
                f.write('\n')
            print(f"✅ 新任務已儲存！")
            break
        elif confirm == 'r':
            print("🔄 重新輸入任務...")
        elif confirm == 'c':
            print("❌ 取消新增任務。")
            break
        else:
            print("❓ 無效選項，請輸入 'y', 'r' 或 'c'。")
```

---

### **(4) 動態讀取與處理任務**
```python
def load_tasks(file_path):
    '''動態讀取 JSONL 檔案'''
    tasks = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                tasks.append(json.loads(line))
    except FileNotFoundError:
        print(f"❌ 檔案 {file_path} 不存在，請檢查路徑。")
    return tasks

def process_tasks(tasks):
    '''處理任務的邏輯'''
    for task in tasks:
        print(f"🚀 正在處理任務：{task.get('ques', '未提供問題')}")
        time.sleep(1)
```

---

### **(5) 指令控制迴圈**
```python
while True:
    command = input("👉 指令 ('a'=新增任務, 'q'=執行任務, 'x'=結束程式)：").lower()

    if command == 'a':
        add_task()

    elif command == 'q':
        tasks = load_tasks(args.test_file)
        if tasks:
            process_tasks(tasks)
        else:
            print("⚠️ 沒有任務可執行，請先新增任務。")

    elif command == 'x':
        print("👋 程式已結束！")
        break

    else:
        print("❓ 無效指令，請輸入 'a'、'q' 或 'x'。")
```

---

## ✅ **4. 執行方式**

```bash
python run.py
```

- `a` → 新增任務。
- `r` → 載入任務。
- `q` → 執行程式或離開任務。

---

## ✅ **5. 注意事項**
- 確保 `.env` 設定正確，否則程式將無法正確讀取 API 金鑰或任務檔案。
- 程式啟動時 `.jsonl` 檔案會自動清空，確保不會誤執行舊任務。
- 新增任務時，務必確認後再儲存，避免誤操作造成 API 費用浪費。








