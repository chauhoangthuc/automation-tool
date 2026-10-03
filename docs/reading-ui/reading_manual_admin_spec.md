# IELTS Space — Đặc tả tool nhập đề Reading thủ công

Phiên bản: 0.2 · Mục tiêu: giao cho Codex trên máy của chủ dự án triển khai. Đây là đặc tả, không phải code đã build.

## 1. Quyết định sản phẩm và thứ tự làm

**Làm một tool admin Reading với hai luồng tạo đề:** `1 passage` và `Full test (3 passages)`. Hai luồng có dashboard, passage editor, question editors, validation và preview chung; khác nhau ở bước tạo và quy tắc đóng gói. Trong cùng vòng đầu, làm preview Reading đủ sát ảnh tham chiếu để admin kiểm chứng dữ liệu. Không dựng hai tool độc lập vì sẽ phải nhân đôi editor cho mọi dạng câu hỏi.

Luồng đầu tiên: tạo passage → nhập title/description/bài đọc → thêm nhóm câu hỏi theo dạng → thêm tùy ý số câu → nhập đáp án, giải thích, chứng cứ → lưu bản nháp → preview đúng dạng → chạy kiểm tra → xuất bản → trang danh sách bài 1 passage có thể lọc theo chủ đề.

`SinglePassageExercise` và `FullReadingTest` là hai loại đối tượng riêng, **không có thuộc tính `mode`**. Passage và question group dùng chung. Tool đầu tiên phải cho tạo được cả hai: single passage gắn 1 passage; full test gắn đúng 3 passage versions, thứ tự 1–3, đồng hồ cấu hình mặc định 60 phút và dải câu đánh liên tục. Admin có thể chọn passage có sẵn hoặc tạo passage mới ngay trong luồng full test.

## 2. Phạm vi bản đầu

### Bắt buộc

- Trang admin: danh sách draft/published, tạo mới, sửa, lưu, sao chép, preview, validate, publish, archive.
- Trình soạn passage: nhãn `READING PASSAGE N` (nếu nhập từ đề giấy), `leadIn` (ví dụ “You should spend…”), `title`, **`description` ngay dưới title**, các section A/B/C... với nhiều block văn bản; hỗ trợ ảnh passage nếu cần.
- Chủ đề: chọn nhiều topic từ danh mục; cho admin tạo topic mới. Ví dụ `environment`, `culture`, `nature`, `modern-life`, `technology`, `history`. Mỗi topic có `slug`, `name`, `description` tùy chọn; slug ổn định, tên có thể sửa.
- Trình soạn question group: thêm/xóa/sắp xếp nhóm, chọn loại, nhập `heading` (Questions 1–5), danh sách các dòng hướng dẫn theo thứ tự: `instruction`, `answer_format`, `note` (dòng NB), tiêu đề phụ, options chung, nội dung bố cục, câu hỏi.
- Nút “Thêm câu” có thể bấm tùy ý. Không hardcode mỗi loại 5 câu; giới hạn hợp lý nếu cần chỉ để bảo vệ dữ liệu, không áp đặt số câu IELTS.
- Lời giải và vị trí: đáp án đúng, giải thích riêng từng ô/câu, bằng chứng gồm `sectionId`, `blockId`, `quote`; admin chọn đoạn văn để gắn, preview “Xem vị trí”. Không suy đoán đáp án hoặc chứng cứ từ text.
- Preview: bên trái passage, bên phải một question group đang chọn, thanh số câu theo passage; cho đổi nhóm. Full test thêm chọn Passage 1/2/3 và thanh số câu toàn bài. Dùng cùng renderer mà trang học viên sẽ dùng. Preview có chế độ “đang làm” và “xem lời giải”.
- Lưu tự động có chỉ báo, nút Lưu rõ ràng, cảnh báo khi rời trang lúc chưa lưu, server trả lỗi validation tại đúng field.
- Trang danh sách bài 1 passage: tìm tên, lọc nhiều topic, phân trang, chỉ hiện published đối với học viên. Cấu trúc URL có thể là `/reading/passages?topic=environment`.
- Xuất/nhập JSON theo schema version để sao lưu và kiểm tra. Nhập là bước phụ trợ; form nhập tay là đường chính.

### Chưa làm trong bản đầu

- OCR/PDF/DOCX/AI tự nhận diện đề; tài khoản học viên, leaderboard và hệ thống chấm điểm production. Preview có thể kiểm tra đáp án với answer key nhưng không cần lưu attempt học viên ở vòng đầu.
- Nếu hệ thống đã có auth/admin, **tích hợp** quyền admin đó. Nếu chưa có, môi trường dev có thể dùng một admin seed, nhưng route ghi/xuất bản tuyệt đối không được mở công khai khi triển khai lên mạng.

## 3. Tech stack yêu cầu

- Frontend: React + TypeScript + Vite, React Router, CSS variables. Ưu tiên component đơn giản, có thể dùng React Hook Form cho form lồng nhau; không phụ thuộc vào thư viện UI nặng nếu chưa cần.
- Backend: Node.js + TypeScript + Express hoặc Fastify (chọn một theo codebase hiện tại); REST API; Zod để kiểm tra payload lúc vào, kèm validation nghiệp vụ ở server.
- Database bản nhỏ: SQLite file thực, migration bằng SQL hoặc ORM đang có trong dự án. Nếu dự án đã dùng PostgreSQL/Firebase thì **không tạo một hệ dữ liệu thứ hai** chỉ vì bản đặc tả này; giữ contract tương đương trên datastore hiện có. SQLite thích hợp cho prototype/local một server, không coi file SQLite là phương án mặc định cho hosting serverless nhiều instance.
- Thư mục gợi ý: `apps/web`, `apps/api`, `packages/reading-schema`. TypeScript types và validator dùng chung từ `reading-schema`, không định nghĩa trùng frontend/backend.
- API phải phân quyền và lọc dữ liệu: response học viên không chứa `correctAnswer`, `explanation`, `evidence` trước khi được phép xem lời giải.

## 4. Thiết kế dữ liệu theo cấp

### 4.1 Mối quan hệ

`Topic` ↔ `SinglePassageExercise` → `PassageVersion` → `QuestionGroup[]` → `Question[]`.

`FullReadingTest` → đúng ba `TestPassage` → ba `PassageVersion` cố định. Một passage sửa lại tạo **version mới**, bài thi đã publish không tự đổi. Bản preview và bản publish đều dùng `schemaVersion` để hỗ trợ migration.

### 4.2 Public JSON (ví dụ rút gọn)

```json
{
  "schemaVersion": 1,
  "passageVersionId": "pv_rain_001",
  "label": "READING PASSAGE 1",
  "leadIn": "You should spend about 20 minutes on Questions 1–5.",
  "title": "How Rainwater Is Collected",
  "description": "A small collection system can turn rainfall into water for the garden.",
  "sections": [
    {
      "id": "sec_a",
      "label": "A",
      "blocks": [
        { "id": "blk_a1", "kind": "paragraph", "text": "A sloping roof directs rainfall into a gutter." }
      ]
    }
  ],
  "questionGroups": [
    {
      "id": "g_1",
      "order": 1,
      "type": "summary_completion_word_box",
      "sourceHeading": "Questions 1–2",
      "instructionBlocks": [
        { "kind": "instruction", "text": "Complete the summary using the list of words below." },
        { "kind": "answer_format", "text": "Write the correct letter, A–G, in boxes 1–2." },
        { "kind": "note", "text": "NB Some options will not be used." }
      ],
      "settings": { "optionReuse": "not_allowed" },
      "options": [
        { "id": "A", "text": "inclined surface" },
        { "id": "B", "text": "drainage channel" },
        { "id": "C", "text": "storage container" },
        { "id": "D", "text": "debris" },
        { "id": "E", "text": "irrigation" },
        { "id": "F", "text": "sunlight" },
        { "id": "G", "text": "electricity" }
      ],
      "content": {
        "kind": "rich_text_with_gaps",
        "title": "From roof to garden",
        "blocks": [
          {
            "kind": "paragraph",
            "parts": [
              { "kind": "text", "text": "Rain falls on an " },
              { "kind": "gap", "questionId": "q_1" },
              { "kind": "text", "text": " before passing through a " },
              { "kind": "gap", "questionId": "q_2" },
              { "kind": "text", "text": "." }
            ]
          }
        ]
      },
      "questions": [
        { "id": "q_1", "number": 1 },
        { "id": "q_2", "number": 2 }
      ]
    }
  ]
}
```

Ví dụ JSON này chỉ có hai câu; **trong dữ liệu thật, heading phải khớp chính xác với danh sách câu**. `questionId` là identity ổn định; `number` là số hiển thị. Một ô trống tương ứng một question, dù nhiều ô cùng trong một đoạn/bảng. Không lưu HTML tùy ý từ admin; rich text dùng các node có cấu trúc để tránh lỗi và render an toàn.

### 4.3 Đáp án riêng (server only)

```json
{
  "questionId": "q_1",
  "acceptedAnswers": ["A"],
  "explanation": "Inclined surface diễn đạt lại sloping roof.",
  "evidence": [
    {
      "sectionId": "sec_a",
      "blockId": "blk_a1",
      "quote": "A sloping roof directs rainfall into a gutter."
    }
  ]
}
```

Lưu đáp án trong bảng/phần riêng. Editor admin có thể nhận cả public content và answer key trong một response riêng có quyền; endpoint học viên chỉ trả public content. `evidence.quote` giúp đọc và so khớp; `blockId` giúp scroll đúng vị trí. Nếu passage đổi, kiểm tra lại bằng chứng trước publish phiên bản mới. Câu không có bằng chứng trực tiếp cần cho phép `evidence` rỗng nhưng yêu cầu giải thích rõ; quy tắc publish có thể cấu hình theo loại.

### 4.4 Dữ liệu bài luyện và bài thi

`SinglePassageExercise`: `id`, `title`, `description`, `slug`, `passageVersionId`, `topicIds[]`, `status`, `publishedAt`.

`FullReadingTest`: `id`, `title`, `description`, `timeLimitMinutes`, `status`, `testPassages: [{order:1, passageVersionId}, {order:2,...}, {order:3,...}]`.

Không có `mode`. Trang/tab nào gọi API nào đã thể hiện loại bài. Số câu trong full test phải liên tục, không trùng; passage đơn có thể bắt đầu từ 1 dù passage nguồn trong sách in số 14–26: khi nhập cần quyết định giữ số gốc hay tạo bản exercise với numbering riêng, không đổi ngầm. Vòng đầu chọn giữ số admin nhập và kiểm tra tính liên tục trong phạm vi exercise.

## 5. Loại question và editor tương ứng

Các `type` cần có trong registry; mỗi type có editor, renderer, validator, answer shape. Không tạo một component form khổng lồ với hàng trăm điều kiện `if`.

| `type` | Admin nhập | Nội dung đặc thù | Kiểu câu trả lời |
| --- | --- | --- | --- |
| `true_false_not_given`, `yes_no_not_given` | Danh sách nhận định | 3 lựa chọn cố định | 1 enum/câu |
| `multiple_choice_single` | Prompt và options/câu | Chọn đúng 1 | 1 option ID/câu |
| `multiple_choice_multiple` | Prompt chung, số đáp án cần chọn, options | Có thể là nhiều **answer slots** mang số câu riêng | Mảng option ID, chấm theo chính sách đã khai báo |
| `matching_headings` | Đoạn văn mục tiêu và danh sách heading | Cho phép heading dư; mỗi paragraph là một câu | 1 option ID/câu |
| `matching_information`, `matching_features`, `matching_sentence_endings` | Prompt/câu và options chung | `settings.optionReuse` theo hướng dẫn, có thể có `NB` | 1 option ID/câu |
| `sentence_completion`, `short_answer` | Câu và ô nhập | word limit/number rule | Text/câu |
| `summary_completion_text`, `note_completion_text`, `table_completion_text`, `flowchart_completion_text` | Nội dung với gap ID | `content.kind` tương ứng; điền từ từ passage | Text/gap |
| `summary_completion_word_box`, `note_completion_word_box`, `table_completion_word_box`, `flowchart_completion_word_box` | Nội dung gap và option bank | Dư option, paraphrase; có/không cho dùng lại | 1 option ID/gap |
| `diagram_completion_text` | Ảnh + nhãn, tọa độ neo gap theo % | Tải ảnh; vị trí co giãn theo kích thước | Text/gap |

Registry mở rộng theo schema/version. Thêm subtype Word Box cho loại có hộp từ thay vì gộp với kiểu gõ từ; phần hướng dẫn, UI, chấm điểm và validation khác nhau. Với `multiple_choice_multiple`, số lượng lựa chọn đúng và số answer slots phải được mô tả rõ để không tính sai 2 điểm thành 1 câu.

## 6. Quy tắc editor và validation

- Admin chọn type → hiện editor thích hợp. Danh sách nhóm có nút “Thêm nhóm”; mỗi nhóm có “Thêm câu/ô” không giới hạn cố định, đổi thứ tự, xóa có xác nhận và undo cơ bản.
- Heading `Questions X–Y` **tính từ số câu** và hiển thị preview; admin có thể giữ bản gốc trong `sourceHeading` nếu đề giấy khác. Không lưu heading và số câu hai nơi rồi để lệch nhau.
- Với completion, bấm “Thêm ô” sẽ tạo `questionId` và node gap cùng lúc. Khi xóa ô, xóa liên kết có xác nhận; khi đổi thứ tự, renumber có preview thay đổi.
- Với notes: editor hỗ trợ heading, subheading, bullet, đoạn văn và gaps. Table: thêm/xóa hàng/cột, ô tĩnh hoặc ô gap. Flowchart: node/bước/mũi tên. Diagram: upload asset, đặt nhãn gap bằng tọa độ phần trăm.
- Option IDs A/B/C… hoặc i/ii… phải duy nhất trong group; `correctAnswer` phải thuộc options; nếu không được dùng lại thì validation chặn đáp án trùng. NB về reuse cần tương ứng với `settings.optionReuse`.
- `wordLimit` áp dụng khi nhập từ passage, không áp dụng máy móc cho word box. Check số câu duy nhất, tăng liên tục, tất cả gap tham chiếu question tồn tại, không có question mồ côi; mỗi question có đáp án đúng và giải thích khi publish; passage và exercise có title/description; chủ đề phải có slug hợp lệ.
- Save draft được phép thiếu dữ liệu để nhập dở, nhưng publish chạy kiểm tra toàn diện và trả danh sách lỗi có đường dẫn như `groups[1].questions[3].explanation`.
- Cần kiểm tra asset upload loại file, dung lượng, quyền truy cập và đường dẫn; admin text phải được render dưới dạng text an toàn, không chạy HTML/script.

## 7. Database nhỏ cho bản đầu

Đề nghị schema quan hệ tối thiểu:

| Bảng | Trường quan trọng | Ghi chú |
| --- | --- | --- |
| `topics` | `id`, `slug UNIQUE`, `name`, `description` | Danh mục chủ đề |
| `passages` | `id`, `created_by`, `created_at`, `updated_at` | Identity ổn định |
| `passage_versions` | `id`, `passage_id`, `version_no`, `status`, `content_json`, `answer_key_json`, `published_at` | Draft cập nhật và snapshot publish bất biến; backend kiểm tra cả hai JSON |
| `single_passage_exercises` | `id`, `slug UNIQUE`, `title`, `description`, `passage_version_id`, `status`, `published_at` | Một exercise trỏ đến một version |
| `exercise_topics` | `exercise_id`, `topic_id` | Many-to-many, index theo topic |
| `media_assets` | `id`, `path`, `mime`, `width`, `height`, `created_at` | Passage/diagram ảnh |
| `full_reading_tests` | `id`, `slug UNIQUE`, `title`, `description`, `time_limit_minutes`, `status`, `published_at` | Full test riêng |
| `test_passages` | `test_id`, `order_no`, `passage_version_id` | UNIQUE(test_id, order_no), đúng 3 khi publish |

Một passage có thể có draft mới cùng lúc một version đã publish. Khi edit bản publish: tạo draft version mới; publish xong cập nhật exercise liên quan **chỉ khi admin chọn**, full test vẫn ghim version cũ. Dùng transaction cho publish, bật foreign keys, migration và seed dữ liệu nhỏ. Dù `content_json` chứa group/question để phát triển nhanh, vẫn tạo index cho `status`, `published_at`, `slug` và bảng nối topic để lọc hiệu quả. Nếu sau này cần analytics theo câu, chuyển group/question sang bảng riêng bằng migration; `id` trong JSON phải ổn định từ đầu.

## 8. API và phân quyền

- Admin: `GET/POST /api/admin/passages`, `GET/PATCH /api/admin/passages/:id/draft`, `POST /api/admin/passages/:id/validate`, `POST /api/admin/passages/:id/publish`, `GET /api/admin/passages/:id/preview`, `POST /api/admin/exercises`, `PATCH /api/admin/exercises/:id`.
- Public: `GET /api/reading/exercises?topic=&q=&page=`, `GET /api/reading/exercises/:slug` trả published public JSON, không answer key.
- Full test: `GET/POST /api/admin/tests`, `GET/PATCH /api/admin/tests/:id`, `POST /api/admin/tests/:id/validate`, `POST /api/admin/tests/:id/publish`; public `GET /api/reading/tests/:slug` gồm 3 public passage versions, validation đúng 3 passages.
- Preview/admin endpoint cần xác thực, rate/size limits phù hợp, lỗi 400/401/403/404/409 rõ ràng; cập nhật draft dùng `revision`/optimistic concurrency để tránh hai tab ghi đè nhau.
- API trả `schemaVersion`; lưu trạng thái admin khác trạng thái học viên. Không dùng localStorage làm database chính.

## 9. Thiết kế UI và design tokens

Tham chiếu các mockup IELTS Space đã chốt: nền lavender rất nhạt, card trắng bo tròn, navy cho chữ, tím cho lựa chọn/primary, vàng nhạt cho highlight, mascot cú ở khu vực gợi ý. Các mã dưới đây là **token triển khai đề xuất**, cần đối chiếu asset thiết kế gốc trong repo nếu đã có token chính thức.

```css
:root {
  --font-ui: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --color-page: #F5F4FC;
  --color-surface: #FFFFFF;
  --color-text: #16173D;
  --color-muted: #6C6B83;
  --color-primary: #6246CC;
  --color-primary-hover: #5036B8;
  --color-primary-soft: #EEEAFE;
  --color-border: #E3E0F1;
  --color-highlight: #FFF2AE;
  --color-success: #14B888;
  --color-warning: #E6A23C;
  --color-danger: #D64558;
  --radius-card: 18px;
  --radius-control: 10px;
  --shadow-card: 0 10px 30px rgba(37, 27, 86, 0.06);
}
```

Typography: Inter (nếu không có asset thì dùng system sans); page title 28–32px/700, section title 20–24px/700, body passage 16–18px với line-height 1.7–1.85, UI body 14–16px, label 12–13px/600. Nội dung passage tiếng Anh cần ưu tiên dễ đọc, không tô toàn bộ thành màu tím. Contrast text đủ rõ; focus ring keyboard dễ thấy.

Admin desktop: sidebar các bước **Thông tin → Bài đọc → Nhóm câu hỏi → Đáp án & giải thích → Kiểm tra & xuất bản**; vùng chính cho form; nút Preview cố định dễ tìm. Mobile: form một cột, tránh bắt admin kéo thả để thao tác cơ bản. Preview desktop hai cột; trái passage scroll độc lập, phải một group đang chọn; footer điều hướng theo **từng answer slot**, nút chuyển group. Full test thêm navigation Passage 1/2/3 ngoài group navigation. Cả admin preview và student dùng cùng question renderers, nhưng không dùng cùng quyền truy cập answer key.

UI states: empty, loading, saving, saved, unsaved, validation error, published, archived; answered/unanswered/bookmarked/current question. Màu tím “đã chọn” **không ám chỉ đáp án đúng**. Chỉ hiện đúng/sai và nút “Giải thích”/“Xem vị trí” khi chế độ review được bật.

## 10. Tìm kiếm và chủ đề single passage

- `topics` là dữ liệu phân loại, không đưa vào `type` câu hỏi. Một exercise có nhiều topic; ví dụ environment + technology.
- Filter multi-select theo slug, tìm tiêu đề/description, sắp theo mới nhất hoặc độ phổ biến khi có dữ liệu; phân trang server. URL phản ánh filter để chia sẻ.
- Trang list chỉ query published exercise; admin list thấy draft. Không dùng text `modern` rời rạc; chuẩn hóa thành slug `modern-life` (tên hiển thị “Modern Life”). Có thể bổ sung difficulty, nguồn đề và estimatedMinutes sau, không bắt buộc trong bản đầu.

## 11. Kế hoạch thực hiện cho Codex local

1. Khảo sát repo, framework, auth, database và design tokens hiện có. Giữ những thứ đã tồn tại; ghi rõ quyết định khác bản đặc tả.
2. Chốt shared TypeScript/Zod schema, enum registry các type, migration SQLite hoặc datastore hiện có, seed 2 topic + 1 passage mẫu + 2 group khác dạng.
3. Xây backend draft CRUD + validate/publish + public safe projection, xác thực admin.
4. Xây React admin shell, editor passage, editor chung group, rồi editor từng type theo registry. Có thể triển khai tuần tự TF/NG → MCQ → Matching → Completion → Diagram, nhưng tiêu chí nghiệm thu của yêu cầu hiện tại là **mọi type trong §16 đều có editor, renderer, validator và preview thật**.
5. Xây preview passage + question group, dùng lại component hiển thị ở public. Thêm “Giải thích” và “Xem vị trí” ở review.
6. Xây single passage list với filter topic; luồng full test 3 passage; kiểm tra keyboard/mobile, validation và đường đi end-to-end.

**Definition of done:** admin tạo passage có description, thêm tùy ý số câu trong nhiều group khác type, gắn answer/explanation/evidence, lưu draft, reload không mất, thấy lỗi publish chính xác, sửa, publish; tạo được full test 3 passage và chuyển được giữa chúng; user lọc bài theo `environment`, mở bài mà network response không lộ answer key; admin preview review nhìn được giải thích và evidence. Mỗi type được khai báo là supported phải có editor, renderer và validation dùng được. Migration/seed và hướng dẫn chạy local phải có trong README.

## 12. Ranh giới và quyết định còn để mở

- Hình 4 có dòng NB: schema dùng `instructionBlocks.kind = note` và `settings.optionReuse`; preview đầu tiên phải hiển thị dòng NB rõ ràng. Chi tiết trang trí có thể tinh chỉnh sau mà không đổi dữ liệu.
- Nguồn đề/copyright: nếu nhập đề có bản quyền, admin cần lưu thông tin nguồn và quyền sử dụng trước khi publish công khai. Có thể thêm `source` metadata trong bản đầu, nhưng không chặn flow bản thử nếu chưa có dữ liệu thật.
- Full test phải ghim version và có validator numbering toàn đề; không giả lập full test bằng một single passage rất dài.

**File schema máy đọc:** [reading.schema.json](reading.schema.json) đi kèm tài liệu này. Đây là JSON Schema Draft 2020-12 dành cho **dữ liệu đã hoàn chỉnh/chuẩn bị publish**; ví dụ tại §4 là fragment minh họa, không phải một bản đề hoàn chỉnh để publish.

## 13. Handoff ảnh tham chiếu và mức độ bám UI

Người dùng sẽ cung cấp ảnh mockup cho Codex local. **Ảnh là nguồn tham chiếu thị giác chính** cho trang học viên/preview; các token ở §9 chỉ là giá trị gần đúng để khởi động. Codex cần:

1. Nhận và lưu danh sách ảnh người dùng gửi vào `docs/reading-ui/references/` hoặc đường dẫn phù hợp trong repo, giữ tên file rõ loại: `tfng`, `ynng`, `matching-headings`, `matching-information`, `matching-features`, `matching-sentence-endings`, `mcq-multiple`, `sentence`, `summary`, `word-box`, `diagram`, `flowchart`, `short-answer`, `table`.
2. Trước khi code, lập mapping **ảnh → loại câu hỏi → phần chung/phần riêng**. Nếu thiếu ảnh một loại, dùng hệ design chung và đánh dấu cần đối chiếu; không tự cho là pixel-perfect.
3. Chụp screenshot app ở viewport gần ảnh gốc và so lần lượt: chiều cao header/footer, tỷ lệ hai cột, padding, kích thước card, chữ, màu, trạng thái option, dải instruction. Sửa sai lệch nhìn thấy được trước khi coi là xong.
4. Giữ logo/mascot/icon từ asset gốc nếu được gửi; không lấy emoji hoặc logo thay thế trong bản hoàn thiện. Nếu ảnh tham chiếu không có asset tách riêng, dùng placeholder có cùng bounding box và ghi rõ asset nào cần thay.
5. Screenshot chỉ mô tả UI, **không phải dữ liệu đề**. Không hardcode passage “Libraries for Everyone” hoặc 5 câu vào component. Seed mẫu để demo có thể dùng nội dung tự viết và phải nằm ở database.

Ảnh `image(5).png` hiện có là tham chiếu cụ thể của TF/NG: khung 1586×992, header khoảng 70–80px, footer cố định khoảng 90px; vùng nội dung hai panel trắng bo tròn, trái khoảng 52%/phải 48%, khe 14–18px, lề ngoài khoảng 20–25px. Header trái logo/breadcrumb, phải practice mode/timer/đóng. Panel trái có tiêu đề “Bài đọc”, toolbar `Highlight`, `Lưu từ`, `Aa`, nhãn Reading Passage, title, đoạn A/B/C/D. Panel phải có heading `Câu hỏi 1–5`, instruction và dải giải nghĩa, các thẻ câu có bookmark. Footer có lưu tự động/progress, 1–5, mascot Gợi ý, Lưu & thoát, Nộp bài. Các số là slot câu thật; 1/2 màu tím cho đã trả lời, 3/4/5 chỉ viền; bookmark vàng độc lập với trạng thái answer. Đây là chuẩn bố cục để các ảnh type khác thay **nội dung panel phải**, không thay shell tùy tiện.

## 14. Hai luồng trong một tool admin

### 14.1 Điều hướng

- `/admin/reading`: dashboard hai thẻ **1 passage** và **Full test**; mỗi thẻ có danh sách, filter, trạng thái draft/published, nút tạo.
- `/admin/reading/passages/new` và `/:id/edit`: editor một passage; từ đây có thể tạo single exercise.
- `/admin/reading/tests/new` và `/:id/edit`: wizard full test, chọn/tạo 3 passage, lần lượt biên tập và xem tổng quan.
- `/admin/reading/preview/passage/:id`, `/admin/reading/preview/test/:id`: preview tương ứng; admin có thể quay về đúng group đang sửa.

**Không tạo hai bộ form riêng.** `PassageEditor`, `GroupShellEditor`, type-specific editors, answer/evidence editor, validator và student renderer là các component dùng chung. Chỉ `SinglePassageSetup` và `FullTestComposer` khác nhau. Dữ liệu là hai loại thực thể riêng, không dùng `mode` để phân nhánh trong một object chung.

### 14.2 Luồng 1 passage

1. Nhập title/description của exercise, topic tags và ước lượng thời gian.
2. Tạo passage mới hoặc chọn version đã có; thêm nhãn/leadIn/title/description, section A/B…
3. Thêm group theo type, không giới hạn số group/câu cố định; nhập instruction, note, options, content, answer key.
4. Preview toàn bài, lưu draft hoặc publish; danh sách public lọc theo topic.

### 14.3 Luồng full test

1. Nhập test title/description, thời gian mặc định 60 phút (admin sửa được), source metadata.
2. Ba slot `Passage 1`, `Passage 2`, `Passage 3`; mỗi slot chọn passage version đã có hoặc `Tạo mới`. Hiển thị trạng thái hoàn thiện của mỗi slot.
3. Trong từng slot dùng **cùng passage editor**. Nếu chọn passage đang có và muốn sửa, tạo version nháp mới; không sửa snapshot đã publish.
4. Summary hiển thị số câu mỗi passage, dải số toàn test, group types; kiểm tra khoảng số không trùng/đứt. Bản IELTS mẫu thường 1–40 nhưng validator không tự ép mọi test đúng 40 trong bản thử; có option `enforceOfficial40` khi admin muốn kiểm tra quy chuẩn.
5. Preview có passage tabs 1–3, đổi passage thì cả panel trái và group panel phải đổi cùng lúc; timer/progress tính theo test. Publish cả test bằng transaction sau khi ba passage versions hợp lệ.

## 15. Wire-spec giao diện học viên/preview chung

### 15.1 Desktop shell

- App bar cao khoảng 72px, background gần trắng; logo trái, breadcrumb `Reading / Tên dạng`, practice mode pill, timer, close ở phải.
- Main dùng grid 2 cột `minmax(0, 1.02fr) minmax(0, .98fr)` trong max-width khoảng 1680px; padding 20–24px; gap 16px. Cao `viewport - header - footer`; mỗi panel scroll **độc lập**.
- Left panel border radius 16–20px, nền trắng, heading/toolbar cố định trong panel; text passage line-height ~1.75; section label tím; description dưới title hiển thị nếu có; highlight vàng; click “Xem vị trí” cuộn trái đến evidence block, bôi rõ quote và focus có kiểm soát.
- Right panel heading/instruction cố định vừa đủ, body group scroll. **Một group hiện ở mỗi thời điểm**, không stack mọi group thành danh sách cuộn 1–40. Nút/tab chuyển group chỉ đổi panel phải và giữ passage trái ở vị trí đang đọc; chọn số câu chuyển đến group chứa slot đó và focus câu tương ứng.
- Footer cố định cao khoảng 85–96px, nền trắng, top border; trái save state/progress, giữa palette các số, phải owl hint/Save & exit/Submit. Với 40 slot phải có layout cuộn ngang hoặc 3 cụm passage, không thu nhỏ chữ đến mức không đọc được. Bookmark là state riêng.
- Full test có Passage 1/2/3 navigation rõ (header phụ hoặc footer), badge số câu/passsage/progress. Chuyển passage lưu scroll position và group đang mở của từng passage.
- Tablet/mobile: không cố ép 2 cột hẹp; tabs `Bài đọc`/`Câu hỏi`, sticky switcher và palette bottom gọn. Evidence jump tự chuyển về tab bài đọc; quay lại câu hỏi giữ vị trí.

### 15.2 Hành vi chung

Đang làm: option selected tím, input có viền tím khi focus, unanswered trắng, bookmark vàng, không tiết lộ đúng/sai. Review: mỗi câu có nút `Giải thích` mở lời giải riêng; `Xem vị trí` cuộn/đánh dấu evidence; với câu NOT GIVEN giải thích có thể nói vì sao passage không cung cấp thông tin, evidence có thể null. Highlight và lưu từ là trạng thái tương tác riêng; nếu chưa có backend lưu từ, demo phải phản hồi rõ, không làm nút chết. Hint có panel/drawer placeholder có mục đích, không giả vờ là chấm đáp án.

### 15.3 Renderer theo loại

| Type | Panel phải phải trông/hoạt động như thế nào |
| --- | --- |
| TF/NG, Y/N/NG | Mỗi nhận định trong card, 3 nút bằng nhau; giải nghĩa TRUE/FALSE/NOT GIVEN hoặc YES/NO/NOT GIVEN ở dải instruction; bookmark góc phải. |
| MCQ một đáp án | Prompt + A–D (hoặc số option admin nhập) ở dạng hàng lớn; chỉ 1 chọn/câu. |
| MCQ nhiều đáp án | Một prompt + options, hiển thị “Chọn N đáp án”; counter `đã chọn k/N`; slot điều hướng là số box được đề quy định; sửa lựa chọn không xóa câu khác. |
| Matching headings | Bank headings i–viii ở đầu hoặc sticky cục bộ; mỗi paragraph target A/B/C là một hàng với select; headings dư còn hiện; hướng dẫn option reuse. |
| Matching information | Danh sách statement; select A/B/C… cho paragraph; cho phép trùng letter nếu đề ghi NB. |
| Matching features | Feature bank (researchers/people/organisations), statement list; note NB dùng option lặp nếu có. |
| Matching sentence endings | Bank endings A–G và các câu đầu; lựa chọn hiện phần cuối câu trong answer slot, giữ chữ cái rõ. |
| Sentence completion | Từng sentence có ô input inline, số câu gắn đúng ô; strip word limit. |
| Summary completion | Khối văn xuôi có heading optional và gap inline; câu số gắn gap, không tách mỗi gap thành card riêng. |
| Notes completion | Heading, subheading, bullets lồng tối đa 2 cấp; gap inline trong bullet. |
| Table completion | Table thực, header/row/column rõ, gap trong cell, overflow ngang nếu cần. |
| Flowchart completion | Các step card nối bằng arrow, gap trong step; reflow dọc khi màn hình hẹp. |
| Diagram completion | Ảnh/diagram và nhãn gap đặt theo anchor phần trăm hoặc callout, zoom/scroll nếu nhỏ; không dùng ảnh AI làm sơ đồ đề thật. |
| Short answer | Prompt riêng từng câu + input, word limit, focus theo palette. |
| Word Box của summary/notes/table/flowchart | Cùng bố cục completion tương ứng + bank A–G; chọn chip rồi chọn gap hoặc dropdown ngay tại gap; options dư vẫn hiện, đã dùng có dấu check; paraphrase do admin nhập, không tự thay bằng từ nguyên văn. |

## 16. Form nhập tay: box bắt buộc theo từng loại

Trước khi triển khai, Codex phải lập `questionTypeRegistry` với `type`, `Editor`, `Renderer`, `validate`, `answerShape`, `defaultDraft`. **Không đánh dấu một type “done” nếu thiếu bất kỳ mắt xích nào.** Các box dưới đây phải xuất hiện ở editor; UI không được ép người nhập JSON thô.

### 16.1 Box chung của mọi group

`Loại câu`, `Thứ tự`, dải câu được sinh tự động, `Instruction` nhiều dòng, `Answer format`, `NB / lưu ý` nhiều dòng, `Tiêu đề nội dung` tùy chọn, các setting theo loại, `Thêm câu/ô`, reorder, delete, preview. Mỗi question/slot có box `Đáp án`, `Giải thích riêng`, `Chứng cứ / Gắn đoạn`, `Xem vị trí`, `Bookmark seed` nếu thực sự cần (mặc định không).

| Loại | Các box riêng trong editor | Điều kiện đặc biệt khi publish |
| --- | --- | --- |
| TF/NG | Repeater `Statement`, đáp án TRUE/FALSE/NOT GIVEN | Enum cố định đúng 3 giá trị. |
| Y/N/NG | Repeater `Statement`, đáp án YES/NO/NOT GIVEN | Không dùng nhầm enum TF/NG. |
| MCQ single | Repeater câu với `Prompt`, repeater `Option label/text`, đáp án 1 ID | Ít nhất 2 options/câu; ID duy nhất. |
| MCQ multiple | `Prompt chung`, `Số lựa chọn phải chọn`, repeater option, số answer slots, tập đáp án | Số correct IDs bằng số yêu cầu; định nghĩa cách lưu slot và chấm không phụ thuộc thứ tự chọn. |
| Matching headings | Repeater heading `roman numeral/text`; repeater paragraph target `sectionId/number`; đáp án heading ID | Target section tồn tại, heading ID không trùng. |
| Matching information | Repeater statement; repeater paragraph option A/B...; `Có thể dùng lại` | NB và setting reuse đồng bộ. |
| Matching features | `Tên danh sách`, repeater feature A/B...; repeater statement; reuse | Có thể ít features hơn questions khi reuse allowed. |
| Matching endings | Repeater beginning; repeater ending A/B...; đáp án ending ID | Endings dư được phép. |
| Sentence completion | Repeater sentence composer `text + gap`, word limit (`maxWords`, `allowNumber`) | Mỗi gap gắn đúng một question; nhiều đáp án hợp lệ nếu cần. |
| Short answer | Repeater `Question prompt`, word limit, accepted answers | Không tự thêm dấu câu vào đáp án lưu. |
| Summary text | `Title`, rich text paragraph blocks, nút Insert gap, word limit | Không có gap mồ côi; số ô không cố định. |
| Notes text | `Title`, heading/subheading/bullet blocks, Insert gap, word limit | Thứ tự bullet/heading được giữ. |
| Table text | `Table title`, số hàng/cột, text cell hoặc gap cell, word limit | Không có bảng rỗng; header hợp lệ. |
| Flowchart text | `Flow title`, repeater step, text/gap, arrow direction, word limit | Edge trỏ step tồn tại; thứ tự rõ. |
| Diagram text | Upload SVG/PNG/JPG, alt text, dimension, callout/repeater gap, anchor % x/y, word limit | Mọi gap nằm trong 0–100% và asset tồn tại. |
| Word Box variants | Tất cả box bố cục của summary/notes/table/flowchart + repeater options `ID/text`, reuse setting | Accepted answer phải là option ID, không kiểm word limit từ passage. |

Một màn hình nhập group nên chia tab con `Nội dung`, `Đáp án & giải thích`, `Preview`; admin nhấn câu ở preview sẽ đưa về box tương ứng. `Add question` sinh ID bất biến rồi cập nhật UI number; nếu chèn giữa dải, hiển thị preview renumber tất cả group sau. Bulk duplicate group không được duplicate question IDs.

## 17. Hợp đồng dữ liệu ở frontend

State tối thiểu: `activePassageId`, `activeGroupId`, `activeQuestionId`, `answersByQuestionId`, `bookmarksByQuestionId`, `scrollByPassageId`, `reviewVisible`, `saveStatus`. State UI không được ghi vào published content. Group list lấy từ passage version; renderer lấy `content.kind`; answer slot lấy từ `questions` và `gap.questionId`. Nếu một group có 6 gap, palette tạo đúng 6 số; với multi-answer có hai số cho một prompt, định nghĩa slot mapping rõ trong registry.

Khi admin sửa passage, preview phản ánh draft qua admin API và không làm lộ answer key ở public API. Khi publish, backend transaction đóng băng version. Nếu dùng autosave debounce, client gửi `revision` và server trả revision mới; xung đột 409 cho admin chọn reload/merge, không ghi đè im lặng.

## 18. Tiêu chí kiểm thử nghiệm thu toàn tool

- Tạo single passage 2 groups: TF/NG 7 câu và word box 4 gap; bỏ dở/reload, dữ liệu còn đủ; preview phải hiện title/description và chuyển group đúng. Filter topic environment tìm được bài sau publish.
- Tạo full test từ 3 passages, mỗi passage có ít nhất 2 dạng; chuyển passage không mất nhóm đang mở và đáp án thử; số câu footer không trùng, không đứt; chỉ publish khi đủ 3 và hợp lệ.
- Smoke test **từng type ở bảng §16**: tạo 2–3 câu/ô, đổi số lượng, nhập answer/explanation/evidence, lưu/reload, preview, publish; mở lại giữ nguyên thứ tự/options. Từng type có lỗi validation cụ thể nếu thiếu option/gap/ảnh.
- Với matching features, bật NB `may use any letter more than once`, dùng chung option cho 2 câu; hệ thống cho chọn và giữ hai đáp án. Tắt reuse phải báo lỗi nếu answer key trùng.
- Với word box, option gốc bài và paraphrase trong bank khác nhau; hai option dư không biến mất; reset/thay option không làm mất các câu khác.
- Admin “Xem vị trí” cuộn đến quote đúng trong passage; chỉnh sửa xóa quote rồi validate phải báo evidence stale. NOT GIVEN có lời giải mà evidence null được chấp nhận khi phù hợp.
- Public API trước review không chứa chuỗi đáp án/giải thích/bằng chứng trong response hay bundle seed. Inspector network kiểm tra thực tế.
- Screenshot so với ảnh người dùng ở desktop và một mobile viewport; kiểm tra scroll trái/phải, footer, focus bàn phím, text zoom và trạng thái option/bookmark; không nộp kết quả khi vẫn dùng card generic cho tất cả type.

**Yêu cầu Codex local báo cáo khi hoàn thành:** file nào được tạo/sửa, command chạy dev/migration/seed, URL admin/preview/public, bảng trạng thái từng type (`Editor`, `Renderer`, `Validator`, `Test`), ảnh screenshot so sánh UI, rủi ro còn lại. Không tuyên bố “xong tất cả dạng” khi còn placeholder hoặc editor chỉ lưu JSON thô.

## 19. Cách dùng JSON Schema chính thức

`reading.schema.json` là schema chuẩn Draft 2020-12. Root schema kiểm tra **public passage version**. Các thực thể khác dùng `$ref` tới cùng file:

| Tài liệu cần validate | `$ref` |
| --- | --- |
| Public passage | `reading.schema.json#/$defs/passageVersion` |
| Answer key riêng trên server | `reading.schema.json#/$defs/answerKey` |
| Single passage exercise | `reading.schema.json#/$defs/singlePassageExercise` |
| Full test | `reading.schema.json#/$defs/fullReadingTest` |

Đây là **shape validation**, chưa thay thế business validation. Codex local cần chuyển schema thành shared TypeScript types/Zod hoặc dùng JSON Schema validator tương thích Draft 2020-12 ở backend; không tự viết kiểu dữ liệu khác hẳn rồi bỏ file schema. Đặc biệt publish phải kiểm tra thêm uniqueness ID, số câu liên tục, sourceHeading khớp nếu có, mọi gap/anchor trỏ đúng question, mỗi question được dùng đúng chỗ, số cột mỗi table row bằng nhau, graph flowchart không trỏ node thiếu, option IDs/answer values hợp lệ, matching reuse, số slot MCQ multi, quote evidence còn nằm trong block, quyền admin và ba passage ở full test khác rỗng, order đúng 1/2/3. Các liên kết tham chiếu này vượt khỏi phạm vi kiểm tra từng object của JSON Schema.

**Draft có thể chưa hoàn chỉnh:** cho phép lưu qua draft DTO riêng với các field đang nhập dở; không ép draft pass schema publish. Khi bấm `Kiểm tra` hoặc `Xuất bản`, backend dựng snapshot hoàn chỉnh, chạy JSON Schema rồi chạy business validation; trả lỗi gắn chính xác box trong admin. Public API chỉ trả passage/exercise/test đã hợp lệ và chỉ trả phần public. Answer key dùng endpoint riêng có quyền admin/review.

Nếu thêm một question type mới, phải đồng thời cập nhật enum/điều kiện trong `reading.schema.json`, registry editor/renderer/validator, dữ liệu mẫu và screenshot kiểm tra. Tăng `schemaVersion` khi thay đổi breaking structure và viết migration cho dữ liệu cũ.
