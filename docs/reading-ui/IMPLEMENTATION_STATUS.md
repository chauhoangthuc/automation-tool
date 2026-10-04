# Đối chiếu Reading UI

Ảnh tham chiếu nằm trong `references/`, ảnh kết quả trong `screenshots/`. Preview được chụp ở **1586×992** bằng Playwright; ảnh admin ở 1440×900. `00-shell-tfng.png` là chuẩn shell chung. Mỗi ảnh theo type chỉ là chuẩn cho panel câu hỏi phải. Nội dung bài mẫu được tạo mới; ảnh tham chiếu có chữ minh họa nên không chép cứng nội dung vào UI.

| Type | Editor | Renderer | Validator | Test | Ảnh đối chiếu |
| --- | --- | --- | --- | --- | --- |
| `true_false_not_given` | Đạt | Đạt | Đạt | API + UI | `00-shell-tfng.png` → `true_false_not_given.png` |
| `yes_no_not_given` | Đạt | Đạt | Đạt | API + UI | `01-yes-no-not-given.png` → `yes_no_not_given.png` |
| `matching_headings` | Đạt | Đạt | Đạt | API + UI | `02-matching-headings.png` → `matching_headings.png` |
| `matching_information` | Đạt | Đạt | Đạt | API + UI | `03-matching-information.png` → `matching_information.png` |
| `matching_features` | Đạt | Đạt | Đạt | API + UI | `04-matching-features.png` → `matching_features.png` |
| `matching_sentence_endings` | Đạt | Đạt | Đạt | API + UI | `05-matching-sentence-endings.png` → `matching_sentence_endings.png` |
| `multiple_choice_single` | Đạt | Đạt | Đạt | API + UI | `06-multiple-choice-single.png` → `multiple_choice_single.png` |
| `multiple_choice_multiple` | Đạt | Đạt | Đạt | API + UI | `07-multiple-choice-multiple.png` → `multiple_choice_multiple.png` |
| `sentence_completion` | Đạt | Đạt | Đạt | API + UI | `08-sentence-completion.png` → `sentence_completion.png` |
| `summary_completion_text` | Đạt | Đạt | Đạt | API + UI | `09-summary-completion-text.png` → `summary_completion_text.png` |
| `summary_completion_word_box` | Đạt | Đạt | Đạt | API + UI | `10-summary-completion-word-box.png` → `summary_completion_word_box.png` |
| `diagram_completion_text` | Đạt | Đạt | Đạt | API + UI | `11-diagram-completion.png` → `diagram_completion_text.png` |
| `flowchart_completion_text` | Đạt | Đạt | Đạt | API + UI | `12-flowchart-completion.png` → `flowchart_completion_text.png` |
| `short_answer` | Đạt | Đạt | Đạt | API + UI | `13-short-answer.png` → `short_answer.png` |
| `table_completion_text` | Đạt | Đạt | Đạt | API + UI | `14-table-completion.png` → `table_completion_text.png` |
| `note_completion_text` | Đạt | Đạt | Đạt | API + UI | Chưa có ảnh chốt → `note_completion_text.png`; **cần duyệt** |
| `note_completion_word_box` | Đạt | Đạt | Đạt | API + UI | Chưa có ảnh chốt → `note_completion_word_box.png`; **cần duyệt** |
| `table_completion_word_box` | Đạt | Đạt | Đạt | API + UI | Ghép Table + Word Box → `table_completion_word_box.png`; **cần duyệt** |
| `flowchart_completion_word_box` | Đạt | Đạt | Đạt | API + UI | Ghép Flowchart + Word Box → `flowchart_completion_word_box.png`; **cần duyệt** |

“Đạt” nghĩa là có form nhập, renderer, validation server và test tạo → lưu → reload → validate → publish. API smoke chạy từng type, Playwright chạy nhập/lưu/reload từng editor; full test và single passage còn có luồng UI đầu cuối. Validation âm kiểm tra quote không còn trong passage, gap mất liên kết, trùng lựa chọn, số câu, MCQ, table, flowchart và diagram.

## Sai lệch và phần cần duyệt

- Góp ý mới về màn làm bài đã được áp dụng: hướng dẫn nhóm cuộn cùng câu hỏi; đánh dấu tại từng câu; footer bỏ Gợi ý/Xem lời giải/Lưu câu và làm nổi bật Lưu & thoát. Lời giải chỉ hiện sau Nộp bài. Ảnh kiểm tra mới: `screenshots/preview-feedback-desktop.png` và `screenshots/preview-feedback-eight-questions.png`.
- Footer full test căn bảng số câu từ đầu thay vì căn giữa một dải rộng hơn viewport, nên câu 1–9 không còn bị cắt khỏi mép trái. Thanh cuộn ngang vẫn cho phép tới câu 40; regression test và ảnh kiểm tra: `tests/full-test-palette.mjs`, `screenshots/full-test-palette-1-40.png`.
- Hai panel desktop dùng thanh chia kéo ngang: tỷ lệ passage/câu hỏi nằm trong 28–72%, lưu trong `localStorage`, hỗ trợ phím mũi tên và nhấp đúp để về 50/50. Mobile vẫn dùng hai tab riêng. Ảnh sau khi thu passage: `screenshots/full-test-resizable-panels.png`.
- Hai hành động chính ở footer có icon SVG: cửa/thoát cho **Lưu & thoát**, máy bay giấy cho **Nộp bài**. Icon được ẩn khỏi accessibility tree để tên nút vẫn ổn định và được regression test kiểm tra kích thước.
- Editor có B/I/A+ cho văn bản passage, hướng dẫn nhóm và prompt; preview giữ dòng NB/Instruction/Answer format đã nhập. Ảnh kiểm tra: `screenshots/reading-format-toolbar.png` và `screenshots/reading-rich-text-and-nb.png`. Đây là thay đổi theo góp ý của người dùng, chưa có ảnh chốt riêng cho thanh định dạng.
- Diagram Completion có vùng đặt ô và điểm nối trực tiếp trên ảnh: chọn ô, bấm, kéo hoặc dùng phím mũi tên; tọa độ ô đồng bộ với các ô số, đường nối tự cập nhật theo cả hai đầu. Ảnh kiểm tra `screenshots/diagram-drag-editor.png`; thao tác đã kiểm tra trên đề draft mẫu mà không ghi thay đổi thử nghiệm vào database.
- Diagram Completion còn có cách đặt ô trả lời bên dưới ảnh đã in sẵn số/đường dẫn. Bản nháp Falkirk Wheel dùng ảnh người dùng cung cấp với câu 20–26; `tests/diagram-below.mjs` kiểm tra Preview và chuyển cách trong editor. Ảnh `screenshots/diagram-falkirk-below-preview.png`. Passage và đáp án gốc chưa được cung cấp, nên bản nháp này không đủ điều kiện xuất bản.
- Có 19 đề mẫu draft độc lập đã nhập passage, câu hỏi đúng dạng, đáp án, giải thích và chứng cứ. `npm run seed:type-previews` tạo/điền ví dụ vào draft mẫu chưa chỉnh, không ghi đè bài người dùng. `tests/type-previews.mjs` kiểm tra server validation, chấm đúng toàn bộ đáp án và renderer của từng dạng; ảnh Preview ở `screenshots/type-previews/`. Bộ lọc dashboard dẫn đến đúng nhóm nếu một bài có nhiều dạng.

- Shell đã có header, passage trái, một group phải và footer điều hướng. Font, icon và khoảng cách chỉ ở mức gần ảnh; logo chữ thay cho logo/mascot vẽ trong ảnh. Cần duyệt nếu muốn chốt pixel và cung cấp asset thương hiệu gốc.
- Nội dung đề mẫu khác ảnh tham chiếu theo chủ ý, nên chỉ đối chiếu bố cục, trạng thái chọn và loại control.
- Bốn type ghi **cần duyệt** ở bảng trên được dựng từ đặc tả; không tuyên bố đã khớp ảnh.
- Admin editor cho cả 19 type chưa có mockup riêng. Đã chụp `admin-dashboard.png`, `admin-true_false_not_given.png`, `admin-diagram_completion_text.png`, `admin-full-test.png` để duyệt hướng giao diện.
- `diagram_completion_word_box` không thuộc registry bắt buộc trong đặc tả, chưa triển khai.
