# IELTS Space — Bản giao việc Codex local

## Bắt đầu

1. Đọc `reading_manual_admin_spec.md` và `reading.schema.json` trước. Đây là yêu cầu sản phẩm, cấu trúc dữ liệu và tiêu chí nghiệm thu.
2. Mở mọi ảnh trong `references/`; ảnh `00-shell-tfng.png` là chuẩn bố cục chung. Từng ảnh còn lại là chuẩn **panel câu hỏi bên phải** của type tương ứng.
3. Đối chiếu screenshot app với ảnh theo cùng viewport; không dùng ảnh chụp làm background, phải dựng React component từ dữ liệu.
4. Đây là các ảnh mẫu giao diện **người học/preview**. Admin editor phải tuân theo bảng box ở §16 của spec; không suy diễn rằng admin trông giống ảnh người học.

## Mapping ảnh → renderer

| Ảnh | Type / vai trò |
| --- | --- |
| `references/00-shell-tfng.png` | `true_false_not_given` và shell chung: header, passage, question, footer |
| `references/01-yes-no-not-given.png` | `yes_no_not_given` |
| `references/02-matching-headings.png` | `matching_headings` |
| `references/03-matching-information.png` | `matching_information` |
| `references/04-matching-features.png` | `matching_features` |
| `references/05-matching-sentence-endings.png` | `matching_sentence_endings` |
| `references/06-multiple-choice-single.png` | `multiple_choice_single` |
| `references/07-multiple-choice-multiple.png` | `multiple_choice_multiple` |
| `references/08-sentence-completion.png` | `sentence_completion` |
| `references/09-summary-completion-text.png` | `summary_completion_text` |
| `references/10-summary-completion-word-box.png` | `summary_completion_word_box` |
| `references/11-diagram-completion.png` | `diagram_completion_text` |
| `references/12-flowchart-completion.png` | `flowchart_completion_text` |
| `references/13-short-answer.png` | `short_answer` |
| `references/14-table-completion.png` | `table_completion_text` |

## Những type chưa có ảnh chốt riêng

- `note_completion_text`, `note_completion_word_box`: dùng khung chung, bố cục notes có heading/subheading/bullets theo spec. Cần người dùng duyệt screenshot riêng.
- `table_completion_word_box`, `flowchart_completion_word_box`: ghép bố cục ảnh Table/Flowchart với bank lựa chọn theo ảnh Summary Word Box. Cần người dùng duyệt screenshot riêng.
- `diagram_completion_word_box` chưa thuộc registry bắt buộc trong spec; chỉ thêm khi có đề thật và thiết kế được duyệt.
- Admin editor cho tất cả type chưa có ảnh mockup riêng; dựng theo spec, trình bày cùng design tokens, gửi screenshot để duyệt.

## Lưu ý

Ảnh có nội dung minh họa, một vài chữ có thể bị sai do tạo ảnh. Nội dung đề/đáp án phải lấy từ JSON admin nhập và validator, không chép cứng chữ trong ảnh. Màu tím trước khi nộp nghĩa là đã chọn, không có nghĩa trả lời đúng.
