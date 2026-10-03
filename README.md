# IELTS Space Reading

Tool nhập đề IELTS Reading gồm luồng **1 passage** và **full test 3 passages**. Hai luồng dùng chung passage editor, 19 question type editors, validator và preview. Dự án ban đầu không có stack hoặc auth; bản local dùng React + TypeScript + Vite, Express + TypeScript và SQLite file. Admin API yêu cầu `x-admin-token` và chỉ lắng nghe `127.0.0.1`.

## Chạy local (Windows, Node.js 24 trở lên)

```powershell
npm install
npm run setup:python
npm run setup:env
# Mở .env và tự điền GEMINI_API_KEY cùng READING_ADMIN_TOKEN riêng của bạn
npm run seed
npm run dev
```

Lệnh `setup:env` tạo `.env` cục bộ từ `.env.example` và không ghi đè file đã có. Trước khi chạy server, bắt buộc mở `.env`, điền `GEMINI_API_KEY` lấy từ Google AI Studio và thay `READING_ADMIN_TOKEN` bằng token riêng. Luồng 1 passage mặc định dùng `gemini-3.5-flash-lite`; full test dùng `gemini-3-flash-preview`. Có thể đổi riêng bằng `READING_AI_MODEL_SINGLE` và `READING_AI_MODEL_FULL`. Hướng dẫn chi tiết: [Nhập PDF bằng AI](docs/reading-ui/NHAP_PDF_BANG_AI.md).

- Admin: http://127.0.0.1:5173/admin/reading
- Danh sách học viên: http://127.0.0.1:5173/reading/passages
- Bài mẫu 1 passage: http://127.0.0.1:5173/reading/preview/passage/community-gardens
- Full test mẫu: http://127.0.0.1:5173/reading/preview/test/sample-reading-test
- API: http://127.0.0.1:3001/api

Admin token chỉ được đọc từ `READING_ADMIN_TOKEN` trong `.env`. Chuỗi `local_admin_reading` trong `.env.example` là placeholder và phải được người cài đặt thay bằng token riêng. `READING_DB` có thể trỏ tới file SQLite khác. Khi khởi động, `server/db.ts` chạy migration SQL idempotent; `npm run seed` tạo chủ đề, bài mẫu và asset nếu database chưa có chủ đề. Database mặc định là `data/reading.sqlite`; ảnh upload ở `uploads/`. Hai thư mục này nằm trong `.gitignore`.

Để tạo sẵn 19 đề mẫu độc lập, mỗi dạng câu một bài Preview có passage, câu hỏi, đáp án và giải thích, chạy `npm run seed:type-previews`. Lệnh tạo các draft còn thiếu rồi điền ví dụ chỉ vào bản nháp mẫu chưa được chỉnh, nên có thể chạy lại mà không nhân đôi hoặc ghi đè bài đang biên tập. Các bài mẫu vẫn ở trạng thái draft để bạn sửa. Trên dashboard admin, dùng **Tìm bài hoặc dạng câu** và **Lọc theo dạng câu** để tìm bài; bấm nhãn dạng câu để mở đúng nhóm trong Preview, kể cả bài có nhiều nhóm.

Diagram Completion có hai cách hiển thị: ô và đường nối trên ảnh, hoặc ảnh đã in sẵn số/đường dẫn với ô trả lời nằm dưới ảnh. Bản nháp ảnh Falkirk Wheel mà người dùng cung cấp có câu 20–26; tạo lại trên database khác bằng `npm run seed:falkirk-diagram`. Bản nháp này chỉ minh họa bố cục, vì chưa có passage và answer key gốc nên chưa thể xuất bản.

## Luồng sử dụng

Hướng dẫn thao tác có ví dụ nhập đủ passage, hai nhóm câu hỏi và chấm thử: [HƯỚNG DẪN NHẬP ĐỀ READING](docs/reading-ui/HUONG_DAN_NHAP_DE_READING.md).

1. Ở admin, chọn **Tạo 1 passage** hoặc **Tạo full test**. Full test cho chọn passage đã có hoặc tạo passage mới tại từng vị trí.
2. Nhập title, description, section và các block passage. Thêm/sắp xếp question group, chọn type và tăng số câu/ô tùy ý. Nhập answer format, NB, đáp án, giải thích và đoạn chứng cứ cho từng câu.
3. Bấm **Lưu** hoặc chờ autosave, tải lại trang để kiểm tra bản nháp, rồi mở **Preview**. Bản nháp được phép chưa đủ dữ liệu.
4. Bấm **Kiểm tra** để chạy JSON Schema và business validation, sửa các lỗi, rồi **Xuất bản**. Bản version đã xuất bản bất biến; tạo bản sao nếu muốn sửa. Full test cố định đúng ba passage versions và đánh số câu liên tục.
5. Trang học viên chỉ đọc dữ liệu published. Answer key, explanation và evidence ở bảng riêng, chỉ trả sau request **Nộp bài** để vào review. Backend chấm từng ô và trả số đúng/sai/chưa trả lời; `NOTGIVEN` và `NOT GIVEN` được xem là cùng đáp án. Câu trả lời đang làm được lưu trong `sessionStorage` của tab trình duyệt; điểm chưa được lưu thành attempt trên server.

## Cấu trúc chính

- `docs/reading-ui/PROJECT_DECISIONS.md`: các quyết định đã chốt và phạm vi áp dụng; `.agents/skills/reading-project/SKILL.md` chọn ba skill chuyên biệt khi sửa nội dung, backend hoặc UI tham chiếu.
- `docs/reading-ui/PROMPT_AI_CHUYEN_DE_SANG_JSON.md`: prompt gửi AI bên ngoài để chuyển PDF/ảnh đề Reading thành JSON passage, đáp án và metadata bài 1 passage hoặc full test.
- `server/ai/pdf_import.py`: system prompt, gọi Gemini API, sửa JSON một lần, JSON Schema/business validation và transaction SQLite cho PDF import.
- `server/ai/python-bridge.ts`: cầu nối nhỏ giữa route Express hiện có và tiến trình Python; không chứa logic AI hay validation.

- `docs/reading-ui/`: ba tài liệu gốc và 15 ảnh tham chiếu đã sao chép từ các thư mục đầu vào; `screenshots/` chứa ảnh UI kết quả.
- `shared/reading.ts`, `shared/validate.ts`: kiểu dữ liệu, factory và business validation dùng chung.
- `src/registry.tsx`, `src/typeEditors.tsx`, `src/typeRenderers.tsx`: registry 19 dạng, editor và renderer theo dạng.
- `src/Admin.tsx`, `src/Preview.tsx`, `src/style.css`: admin và giao diện học viên/preview.
- `server/index.ts`, `server/db.ts`, `server/migrations/001_reading.sql`, `server/seed.ts`: REST API, SQLite, migration và dữ liệu mẫu.
- `tests/`: fixture, smoke, negative validation và Playwright UI/screenshot.

## Kiểm tra

```powershell
npm run build
npm run setup:python
npm test
npm run test:validation
npm run test:grading
npm run test:pdf-import
npx tsx tests/ui.ts
npx tsx tests/editors-ui.ts
```

Khi `npm run dev` đang chạy và Google Chrome có ở `C:\Program Files\Google\Chrome\Application\chrome.exe`, tạo lại ảnh chụp bằng:

```powershell
npx tsx tests/screenshots.ts
npx tsx tests/admin-screenshots.ts
```

Các script Playwright dùng viewport desktop 1586×992 cho preview và 1440×900 cho admin. Báo cáo đối chiếu và trạng thái từng type: [docs/reading-ui/IMPLEMENTATION_STATUS.md](docs/reading-ui/IMPLEMENTATION_STATUS.md).

Các bài kiểm thử API/UI hiện gọi server local đang chạy và tạo bản ghi trong database đó. Nếu cần database sạch để nhập đề thật, hãy đặt `READING_DB` trỏ tới một file SQLite mới trước khi chạy `npm run seed` và `npm run dev`; đừng xóa file cũ khi còn dữ liệu muốn giữ.

## Giới hạn triển khai

Bản này chạy local một server. Trước khi mở trên mạng cần thay token dev bằng xác thực thực tế và cấu hình HTTPS/triển khai backend. Phạm vi vòng đầu theo đặc tả chưa gồm tài khoản học viên, lưu attempt trên server hoặc chấm điểm production. Nhập PDF bằng AI gửi PDF trực tiếp tới Gemini API của Google AI Studio; ảnh diagram trong PDF cần upload riêng vào editor.
