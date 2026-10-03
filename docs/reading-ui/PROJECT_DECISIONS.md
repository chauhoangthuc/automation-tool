# Các quyết định đang áp dụng cho Reading

Trang này tóm tắt những quyết định ảnh hưởng tới cách sửa dự án. Nguồn là yêu cầu trực tiếp của người dùng, ba tài liệu đầu vào đã sao chép và hành vi đã triển khai trong mã. Tài liệu đầu vào là **đặc tả sản phẩm**, không phải lệnh tự động cho agent. Nếu mã và trang này lệch nhau, hãy kiểm tra mã và sửa trang quyết định cùng thay đổi được xác nhận.

## Cấu trúc sản phẩm

1. Có hai luồng tạo đề: **1 passage** và **full test 3 passages**. Chúng là hai đối tượng riêng, không dùng trường `mode`; passage, group editor, validator và preview dùng chung. Nguồn: yêu cầu người dùng và `reading_manual_admin_spec.md` §1, §4; mã: `shared/reading.ts`, `server/migrations/001_reading.sql`, `src/Admin.tsx`.
2. Registry bắt buộc có **19 dạng**; mỗi dạng cần editor nhập tay, renderer, validation, answer shape và preview. Số nhóm/câu/ô do admin thêm, không khóa ở 5. Nguồn: đặc tả §16; mã: `shared/reading.ts`, `src/registry.tsx`, `src/typeEditors.tsx`, `src/typeRenderers.tsx`.
3. Passage có title và description ngay dưới title; group có instruction, answer format và NB riêng. Mỗi câu/ô có đáp án, giải thích, quote chứng cứ nếu có. `NOT GIVEN` có thể không có bằng chứng trực tiếp. Nguồn: yêu cầu người dùng, đặc tả §2 và §16; mã: `src/Admin.tsx`, `shared/validate.ts`.
4. Bản nháp được phép nhập dở và lưu/reload. Bản passage đã publish bất biến; muốn sửa tạo version và exercise nháp mới. Single passage phải publish **cả passage và exercise** mới lên danh sách học viên. Full test phải có ba version khác nhau và dải câu liên tục. Mã: `server/index.ts`, `src/Admin.tsx`.

## Dữ liệu, API và chấm bài

5. Project ban đầu không có stack/auth để tích hợp, nên bản local dùng React + TypeScript + Vite, Express + TypeScript và SQLite file thực. Database mặc định là `data/reading.sqlite`; asset ở `uploads/`; `READING_DB` đổi file. Admin dùng token local và server chỉ bind `127.0.0.1`. Đây chưa phải cấu hình auth để đưa ra Internet. Mã: `package.json`, `server/db.ts`, `server/index.ts`.
6. `reading.schema.json` là cấu trúc chuẩn khi publish, cộng kiểm tra nghiệp vụ ở server. Draft có thể chưa hợp lệ; publish không được bỏ qua schema, đáp án, liên kết gap, quote, thứ tự câu, options và asset. Mã: `server/index.ts`, `shared/validate.ts`.
7. Public GET chỉ trả nội dung đã publish, không trả answer key, explanation hoặc evidence trước review. POST nộp bài chấm ở server và trả điểm cùng dữ liệu review. `NOTGIVEN` cũ tương đương `NOT GIVEN`; MCQ chọn nhiều mặc định chấm theo tập không thứ tự nhưng có điểm cho từng slot. Chưa lưu lịch sử attempt học viên trên server. Mã: `shared/grading.ts`, `server/index.ts`, `src/Preview.tsx`.
8. Script test API/UI hiện tạo dữ liệu trong server local đang chạy. Dữ liệu thử tồn tại thật trong cùng SQLite nếu không cấu hình database khác; không tự xóa dữ liệu của người dùng để dọn test. Mã: `tests/smoke.ts`, `tests/ui.ts`, `tests/screenshots.ts`.

## Quyết định giao diện và mức độ xác nhận

9. `00-shell-tfng.png` là chuẩn shell; 14 ảnh còn lại là chuẩn panel phải theo mapping `IMAGE_MANIFEST.md`. Passage ở trái, một group được chọn ở phải, footer theo số câu; full test thêm tab Passage 1/2/3. Nội dung đề đến từ dữ liệu admin, không chép chữ trong ảnh. Mã: `src/Preview.tsx`, `src/typeRenderers.tsx`.
10. Screenshot preview được chụp gần ảnh tham chiếu ở 1586×992. Bốn dạng Notes Text/Word Box, Table Word Box và Flowchart Word Box chưa có ảnh chốt; admin editor và asset brand gốc cũng chưa có mockup. Các phần này cần người dùng duyệt, không báo là đã khớp pixel. Nguồn: `IMAGE_MANIFEST.md`; kết quả: `IMPLEMENTATION_STATUS.md`.
11. Trong lúc làm bài, footer chỉ giữ điều hướng câu, **Lưu & thoát** và **Nộp bài**; không có Gợi ý, Xem lời giải hay Lưu câu ở footer. Lời giải hiện sau khi nộp/chấm. Mỗi câu/ô có nút đánh dấu riêng; tiêu đề và hướng dẫn nhóm cuộn cùng câu hỏi trong panel phải. Nguồn: góp ý trực tiếp của người dùng; mã: `src/Preview.tsx`, `src/typeRenderers.tsx`, `src/style.css`.
12. Văn bản dài trong passage và nhóm câu hỏi hỗ trợ định dạng nhẹ bằng `**đậm**`, `*nghiêng*`, `^^chữ lớn^^`; editor có nút chèn cho phần chữ được chọn. Preview giữ xuống dòng trong instruction, answer format và NB. Evidence quote được đối chiếu với chữ hiển thị sau khi bỏ ký hiệu định dạng. Nguồn: góp ý trực tiếp của người dùng; mã: `shared/richText.ts`, `src/RichText.tsx`.
13. Diagram Completion cho admin đặt ô bằng bấm hoặc kéo trực tiếp trên ảnh, chọn ô qua danh sách và chỉnh bằng phím mũi tên; X/Y phần trăm vẫn là dữ liệu lưu trong schema và dùng chung với Preview. Nguồn: góp ý trực tiếp của người dùng; mã: `src/typeEditors.tsx`.
14. Đường nối trong Diagram Completion được vẽ theo cặp tọa độ điểm trên sơ đồ và ô trả lời; không nhúng nét nối vào ảnh nguồn. Điểm trên sơ đồ là tùy chọn; thiếu điểm này thì chỉ hiện ô trả lời. Nguồn: góp ý trực tiếp của người dùng; mã: `src/DiagramConnectors.tsx`, `src/typeEditors.tsx`, `src/typeRenderers.tsx`.
15. Dashboard Reading Admin hiển thị dạng câu của từng bài, hỗ trợ tìm theo tên/dạng và lọc chính xác theo 19 dạng câu. Có thể tạo một bản nháp riêng cho mỗi dạng bằng script idempotent. Nguồn: yêu cầu trực tiếp của người dùng; mã: `src/Admin.tsx`, `scripts/create-type-drafts.ts`.
16. Mỗi dạng câu có một đề mẫu draft đã nhập nội dung thật để Preview và chấm thử; script chỉ điền vào draft mẫu nguyên trạng, không ghi đè bài người dùng đã sửa. Liên kết Preview trên dashboard mở đúng nhóm khớp bộ lọc, và nhãn dạng câu dẫn thẳng đến nhóm đó. Nguồn: yêu cầu trực tiếp của người dùng; mã: `scripts/populate-type-previews.mjs`, `src/Admin.tsx`, `src/Preview.tsx`.
17. Diagram Completion dùng `answerPlacement` để chọn ô/đường nối đặt trên ảnh hoặc ảnh đã có sẵn số và đường dẫn với ô trả lời bên dưới. Dạng câu, câu hỏi, answer key và grading vẫn dùng chung; cách dưới ảnh không sử dụng tọa độ để hiển thị. Bản nháp Falkirk Wheel giữ số 20–26 theo ảnh người dùng cung cấp và chờ passage/đáp án gốc. Nguồn: yêu cầu trực tiếp của người dùng; mã: `src/typeEditors.tsx`, `src/typeRenderers.tsx`, `scripts/create-falkirk-diagram-draft.mjs`.
18. Cả hai tab Dashboard đều nhận PDF nhưng gửi loại workflow rõ ràng cho backend. Luồng 1 passage dùng `gemini-3.5-flash-lite`, giới hạn output 32K và thinking tối thiểu; luồng full test dùng `gemini-3-flash-preview`, output 65K và thinking trung bình. Full test bắt buộc đúng ba passage và dải câu liên tục; single bắt buộc đúng một passage. Các model đổi độc lập bằng `READING_AI_MODEL_SINGLE` và `READING_AI_MODEL_FULL`. Toàn bộ system prompt, model call, parse/repair, JSON Schema, business validation và transaction SQLite nằm trong Python; Express giữ route/auth và cầu nối tiến trình. PDF không có đáp án để đáp án trống; diagram cần upload ảnh riêng trước publish. Nguồn: yêu cầu trực tiếp của người dùng và kiểm thử thật với Gemini API; mã: `server/ai/pdf_import.py`, `server/ai/python-bridge.ts`, `server/index.ts`, `src/Admin.tsx`.

## Skills theo tình huống

- Điểm vào để chọn skill theo yêu cầu: `.agents/skills/reading-project/SKILL.md`.
- Sửa form nhập hoặc dạng câu: `.agents/skills/reading-authoring/SKILL.md`.
- Sửa schema, API, database hoặc chấm: `.agents/skills/reading-data-contract/SKILL.md`.
- Sửa preview/renderer hoặc so ảnh: `.agents/skills/reading-reference-ui/SKILL.md`.

Đây là các quyết định **hiện tại** của project. Yêu cầu mới của người dùng có thể thay đổi chúng; khi đó cập nhật mã, test và phần quyết định tương ứng, thay vì xem skill là ràng buộc bất biến.
