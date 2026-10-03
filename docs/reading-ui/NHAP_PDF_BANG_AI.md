# Nhập đề Reading trực tiếp từ PDF

## Cấu hình

1. Mở file `.env` ở thư mục gốc project và điền `GEMINI_API_KEY` lấy từ Google AI Studio. Khóa chỉ được server đọc; không đặt trong biến `VITE_` hoặc frontend.
2. Chạy `npm run setup:python` một lần để tạo `.venv` và cài `jsonschema`. Nếu máy không tìm thấy Python, đặt `READING_PYTHON` trong `.env` tới `python.exe` rồi chạy lại lệnh setup.
3. Có hai profile model độc lập. `READING_AI_MODEL_SINGLE` mặc định là `gemini-3.5-flash-lite` để nhập một passage nhanh và tiết kiệm. `READING_AI_MODEL_FULL` mặc định là `gemini-3-flash-preview` để xử lý ba passage, output lớn và cấu trúc phức tạp hơn. Giá trị mặc định trong code nằm ở `server/ai/pdf_import.py`.
4. Khởi động lại `npm run dev` sau khi sửa `.env`.

Tính năng dùng Gemini `generateContent` đồng bộ để trả kết quả và lưu draft ngay trong lần upload.

## Thao tác

Vào `http://127.0.0.1:5173/admin/reading`. Ở tab **1 passage**, nút import yêu cầu PDF chứa đúng một passage. Ở tab **Full test · 3 passages**, nút import yêu cầu đúng ba passages và dùng profile model mạnh hơn. Bản nháp được ghi vào SQLite `data/reading.sqlite`. Nếu model/API lỗi, trả sai loại bundle hoặc JSON không đạt kiểm tra cấu trúc sau một lần sửa tự động, server không ghi bản nháp nào.

Khi nhập xong, dashboard hiện liên kết mở editor và danh sách **Cần kiểm tra**. Đối chiếu nguyên văn passage, câu hỏi, thứ tự và đáp án với PDF, chạy Validate rồi mới publish. Nếu PDF không có answer key, các đáp án thiếu được để rỗng trong draft. Với Diagram Completion, AI dựng câu và vị trí đáp án nhưng chưa tự tách ảnh PDF thành asset; upload ảnh sơ đồ ở editor và căn ô trước khi publish. `assetId` rỗng và danh sách Cần kiểm tra báo rõ việc này.

PDF được gửi dạng `inlineData` base64 từ backend tới Gemini API và không được lưu lâu dài trên server. API key không trả về API public. File PDF có thể chứa thông tin riêng, nên chỉ nhập tài liệu bạn muốn gửi cho Google Gemini.

## Cách kiểm tra không dùng API key thật

`npm run test:pdf-import` chạy trực tiếp bộ test Python cho schema, draft thiếu đáp án, ID trùng và transaction SQLite. `npm run build` kiểm tra cầu nối TypeScript/UI. Kiểm tra gọi model thật cần bạn điền API key vào `.env`, khởi động lại server và nhập PDF trên dashboard. Đây là bước duy nhất chưa thể tự chạy khi key còn trống.

Toàn bộ system prompt, Gemini API client, parse/repair, JSON Schema, business validation và ghi draft SQLite của tính năng này nằm trong `server/ai/pdf_import.py`. Express chỉ nhận request có token admin, chuyển file tạm sang Python và trả JSON cho giao diện.

Nguồn định dạng PDF request: [Gemini Document Processing](https://ai.google.dev/gemini-api/docs/document-processing). Schema xuất bản: [reading.schema.json](reading.schema.json). Prompt và quy tắc 19 dạng: [PROMPT_AI_CHUYEN_DE_SANG_JSON.md](PROMPT_AI_CHUYEN_DE_SANG_JSON.md).
