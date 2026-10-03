# Prompt chuyển PDF/ảnh IELTS Reading thành JSON cho tool admin

Tài liệu này dành cho AI bên ngoài nhận **PDF hoặc ảnh của đề**. Sao chép toàn bộ phần **Prompt để gửi AI** bên dưới, rồi đính kèm tất cả trang đề, trang đáp án và hình/sơ đồ nếu có. Nếu có `reading.schema.json`, đính kèm thêm file đó để AI tự kiểm tra hình dạng JSON.

## Đầu ra dùng được đến mức nào?

- Mỗi phần tử `{ "content": ..., "answerKey": ... }` là body phù hợp với `POST /api/admin/passages/import`. API tạo một passage **draft** và cấp `passageVersionId` mới. Dùng `x-admin-token` theo cấu hình local. **Giao diện admin hiện chưa có nút Import JSON.**
- Với **1 passage**, metadata `exercise` trong đầu ra là thông tin để tạo `SinglePassageExercise` sau khi import passage. Với **full test**, import riêng ba passage, lấy ba ID server trả về theo thứ tự rồi tạo `FullReadingTest`. API hiện chưa nhận nguyên một bundle full test trong một request.
- `diagram_completion_text` cần upload ảnh riêng qua `/api/admin/assets`, sau đó thay `content.assetId` bằng ID asset server trả về. AI không thể tự biết asset ID từ PDF/ảnh.
- JSON từ AI vẫn cần admin so với bản gốc, chạy **Validate** rồi mới publish. Khi nguồn thiếu đáp án hoặc chữ không đọc rõ, giữ draft và báo chỗ cần kiểm tra; không bịa đáp án để vượt validation.

## Prompt để gửi AI

```text
Bạn là người chuyển đề IELTS Reading từ PDF hoặc ảnh thành JSON cho tool admin của tôi. Hãy đọc toàn bộ file/trang tôi đính kèm, gồm passage, câu hỏi, đáp án và hình. Nếu tài liệu chỉ có 1 passage, xuất single passage. Nếu có đúng 3 passages của một bài thi, xuất full test. Không gộp nhiều passages thành một passage và không thêm trường `mode` vào bất kỳ object dữ liệu nào.

MỤC TIÊU ĐẦU RA
Chỉ trả một JSON object hợp lệ, không Markdown, không code fence, không giải thích ngoài JSON:

Trường hợp 1 passage:
{
  "kind": "single_passage_bundle",
  "passages": [{ "content": { ...PassageVersion }, "answerKey": { ...AnswerKey } }],
  "exercise": { "slug": "...", "title": "...", "description": "...", "topicIds": [] },
  "needsReview": []
}

Trường hợp full test:
{
  "kind": "full_test_bundle",
  "passages": [
    { "content": { ...PassageVersion1 }, "answerKey": { ...AnswerKey1 } },
    { "content": { ...PassageVersion2 }, "answerKey": { ...AnswerKey2 } },
    { "content": { ...PassageVersion3 }, "answerKey": { ...AnswerKey3 } }
  ],
  "test": { "slug": "...", "title": "...", "description": "...", "timeLimitMinutes": 60 },
  "needsReview": []
}

`kind`, `passages`, `exercise`/`test`, `needsReview` là vỏ bàn giao, KHÔNG phải một PassageVersion trong schema. Khi nhập từng passage, lấy riêng object `passages[i]` gồm `content` và `answerKey`. `needsReview` là mảng chuỗi mô tả chính xác trang/câu nào cần người kiểm tra. Không đặt nhận xét vào `content` hoặc `answerKey` vì schema cấm field lạ.

HÌNH DẠNG PASSAGE
`content` có đúng các field cần thiết sau:
{
  "schemaVersion": 1,
  "passageVersionId": "pv_source_1",
  "label": "READING PASSAGE 1",
  "leadIn": "You should spend about 20 minutes on Questions 1–13",
  "title": "Tiêu đề bài đọc nguyên văn",
  "description": "Mô tả/phụ đề ngay dưới title, nếu có; nếu bản gốc không có hãy ghi mô tả ngắn trung thực",
  "sections": [
    { "id": "sec_1_A", "label": "A", "blocks": [
      { "id": "blk_1_A_1", "kind": "paragraph", "text": "Nguyên văn đoạn 1" }
    ] }
  ],
  "questionGroups": [ ... ]
}
`label`, `leadIn` có thể bỏ nếu nguồn không có. `description` phải có nội dung khi chuẩn bị publish. `sections` theo A/B/C... nếu đề có nhãn; nếu không, chia đoạn hợp lý và đặt label rõ ràng. Giữ nguyên thứ tự, dấu câu và chữ của passage. `blocks.kind` chỉ là `paragraph`, `subheading`, `caption`. Mỗi block phải có ID duy nhất trong passage. Không trộn title/description vào paragraph đầu tiên.

`answerKey` của cùng passage:
{
  "schemaVersion": 1,
  "passageVersionId": "pv_source_1",
  "answers": [
    {
      "questionId": "q_1",
      "acceptedAnswers": ["TRUE"],
      "explanation": "Giải thích riêng cho câu 1, dựa trên bản gốc",
      "evidence": [{ "sectionId": "sec_1_A", "blockId": "blk_1_A_1", "quote": "Trích nguyên văn liên tiếp nằm trong text của block" }]
    }
  ]
}
Phải có đúng một AnswerEntry cho mỗi `questions[].id`. `answerKey.passageVersionId` bằng `content.passageVersionId`. `evidence.quote` phải là chuỗi con nguyên văn của block được trỏ tới. Với NOT GIVEN hoặc câu không có quote trực tiếp, dùng `evidence: []` và giải thích lý do; không bịa quote. Nếu nguồn không có đáp án đáng tin, dùng `acceptedAnswers: []`, `explanation: ""`, `evidence: []` và ghi câu đó trong `needsReview`. Đây là draft chưa thể publish. Chỉ thêm biến thể vào `acceptedAnswers` khi chắc chắn đều hợp lệ. Với TF/NG và Y/N/NG dùng `NOT GIVEN` có dấu cách, không dùng `NOTGIVEN`.

HÌNH DẠNG QUESTION GROUP
Mỗi group:
{
  "id": "g_1_1",
  "order": 1,
  "type": "một trong 19 type bên dưới",
  "sourceHeading": "Questions 1–5",
  "instructionBlocks": [
    { "kind": "instruction", "text": "Chỉ dẫn nguyên văn từ đề" },
    { "kind": "answer_format", "text": "Write TRUE, FALSE or NOT GIVEN in boxes 1–5." },
    { "kind": "note", "text": "NB nguyên văn nếu có" }
  ],
  "content": { "kind": "question_list" },
  "questions": [{ "id": "q_1", "number": 1, "prompt": "Nguyên văn câu hỏi" }]
}
`order` chạy 1,2,... trong từng passage. `questions[].number` tăng liên tục: single passage theo số đề; full test liên tục trên cả 3 passages, thường 1–40. `sourceHeading` nếu có phải khớp số đầu/cuối của group. `instructionBlocks` bắt buộc có ít nhất một `instruction` không rỗng; thêm `answer_format` và `note` chỉ khi có nội dung thật, không ghi `NONE`. Đặt ID chỉ gồm chữ, số, `_`, `-`; ID section/block/group/question phải nhất quán trong mọi tham chiếu. Số câu/ô và số group tùy đề, tuyệt đối không giới hạn ở 5.

19 TYPE VÀ CÁCH ĐẶT FIELD
1. `true_false_not_given`: `content:{"kind":"question_list"}`; mỗi question có `prompt` là statement. Đáp án mỗi câu: `TRUE` / `FALSE` / `NOT GIVEN`.
2. `yes_no_not_given`: giống type 1, nhưng đáp án `YES` / `NO` / `NOT GIVEN`.
3. `multiple_choice_single`: `content:{"kind":"question_list"}`; mỗi question có `prompt` và `options:[{"id":"A","text":"..."}, ...]` riêng, tối thiểu 2 options. Đáp án là ID option, ví dụ `A`.
4. `multiple_choice_multiple`: `content:{"kind":"question_list"}`; `options` đặt ở GROUP; `settings:{"selectionCount":2,"scoring":"unordered_set"}` nếu chọn TWO; group có đúng 2 question/answer slots, prompt chung ở question đầu. Hai đáp án là hai ID option khác nhau. Với THREE dùng 3 slots.
5. `matching_headings`: `content:{"kind":"question_list"}`; `options` ở GROUP, ID có thể là `i`,`ii`,`iii`; mỗi question có `targetSectionId` trỏ tới `sections[].id`; đáp án là option ID.
6. `matching_information`: `content:{"kind":"question_list"}`; `options` ở GROUP, thường A/B/C trỏ tới đoạn; mỗi question có `prompt`; đáp án là option ID.
7. `matching_features`: như type 6, options là feature/person/place; mỗi question có `prompt`.
8. `matching_sentence_endings`: như type 6, options là phần kết; mỗi question có `prompt` là phần mở đầu.
9. `sentence_completion`: `content:{"kind":"question_list"}`; mỗi `prompt` là câu chứa đúng marker `[[gap]]` tại chỗ trống; `settings.maxWords` và `allowNumber` theo chỉ dẫn; đáp án là chữ, không có marker.
10. `short_answer`: `content:{"kind":"question_list"}`; mỗi question có `prompt`; `settings.maxWords` và `allowNumber` theo chỉ dẫn; đáp án là chữ/số theo đề.
11. `summary_completion_text`: `content.kind:"rich_text_with_gaps"`, `blocks` gồm paragraph/heading/subheading/bullet với `parts` là `{ "kind":"text","text":"..." }` hoặc `{ "kind":"gap","questionId":"q_..." }`; `settings.maxWords` theo đề; đáp án là chữ.
12. `note_completion_text`: giống type 11 nhưng `content.kind:"notes"`; dùng heading, subheading, bullet theo bố cục gốc.
13. `table_completion_text`: `content:{"kind":"table","title":"...","rows":[[{"parts":[{"kind":"text","text":"Header"}],"isHeader":true}], [{"parts":[{"kind":"gap","questionId":"q_..."}]}]]}`; mỗi hàng cùng số cột; hàng đầu có header; đáp án là chữ.
14. `flowchart_completion_text`: `content:{"kind":"flowchart","title":"...","steps":[{"id":"step_1","parts":[{"kind":"text","text":"..."},{"kind":"gap","questionId":"q_..."}],"nextStepIds":["step_2"]},{"id":"step_2","parts":[{"kind":"text","text":"..."}]}]}`; mọi nextStepId phải tồn tại; đáp án là chữ.
15. `diagram_completion_text` có hai cách đặt ô. Nếu ảnh sạch và cần đặt ô lên ảnh, dùng `content:{"kind":"diagram","answerPlacement":"image","title":"...","assetId":"ID_ASSET_CAN_THAY","alt":"Mô tả sơ đồ","anchors":[{"questionId":"q_...","xPercent":50,"yPercent":70,"label":"Part 1"}]}`; tọa độ 0–100 theo ảnh, có thể thêm `sourceXPercent`/`sourceYPercent` để vẽ đường nối. Nếu ảnh đã in sẵn số câu và nét chỉ dẫn, dùng `"answerPlacement":"below"` với một anchor cho mỗi câu, `xPercent`/`yPercent` đặt 50 để đúng schema nhưng không hiển thị; học viên sẽ điền các ô mang đúng số câu ở dưới ảnh. Giữ nguyên số câu của nguồn (ví dụ 20–26), không vẽ thêm đường lên ảnh. Đáp án là chữ; nếu ảnh không kèm passage hoặc answer key, để draft chưa hoàn chỉnh và ghi rõ trong `needsReview`, không đoán. Admin phải upload hình và thay `assetId` trước khi publish.
16. `summary_completion_word_box`: bố cục `rich_text_with_gaps` như type 11; thêm `options` ở GROUP; đáp án là ID option, không phải chữ hiển thị.
17. `note_completion_word_box`: bố cục `notes` như type 12; thêm group options; đáp án là ID option.
18. `table_completion_word_box`: bố cục `table` như type 13; thêm group options; đáp án là ID option.
19. `flowchart_completion_word_box`: bố cục `flowchart` như type 14; thêm group options; đáp án là ID option.

Với matching và word box, dùng `settings:{"optionReuse":"allowed"}` nếu đề cho phép dùng lại option, ngược lại `"not_allowed"`. Nếu không rõ, ghi vào `needsReview` và không tự khẳng định quy tắc. Với text completion và short answer, `maxWords` phải là số nguyên >=1 theo instruction; `allowNumber` phản ánh việc đề cho phép số. Đừng thêm `settings` không liên quan. `diagram_completion_word_box` không thuộc 19 type của tool.

QUY TẮC CHUYỂN TỪ PDF/ẢNH
- Phân biệt passage text, heading/subheading, instruction, answer format, NB, câu hỏi, danh sách options, bảng, flowchart và sơ đồ. Giữ nguyên nội dung tiếng Anh của đề; không dịch passage/câu hỏi. Có thể viết explanation bằng tiếng Việt rõ ràng.
- OCR cẩn thận các nhãn A/B/C, chữ La Mã i/ii/iii, số câu và dấu nối. Nếu một trang bị cắt/mờ/thiếu, ghi trong `needsReview` theo trang và câu; không tự điền nội dung như thể đã đọc được.
- Nếu answer key nguồn khác với suy luận từ passage, ghi mâu thuẫn trong `needsReview`. Không âm thầm sửa key. Nếu chỉ có đề, có thể suy luận đáp án khi chứng cứ rõ; ghi trong `needsReview` những đáp án suy luận và mức chưa chắc chắn.
- Ảnh của sơ đồ không thể nằm trong JSON này. Ghi tên file/trang gốc, alt text và vị trí gap ước lượng trong `needsReview`; `assetId` chỉ là placeholder cần thay.
- Không tạo option text hoặc distractor mới. Không tạo câu hỏi mới. Giữ thứ tự và số câu như nguồn; mỗi gap đúng một question ID và mỗi question ID xuất hiện đúng một gap/anchor ở các dạng completion.
- JSON phải parse được: dấu nháy kép chuẩn, không comment, không dấu phẩy thừa, không `...` trong kết quả thực. Không có property ngoài shape. Tự kiểm tra cấu trúc theo `reading.schema.json` nếu được cung cấp.

TỰ KIỂM TRA TRƯỚC KHI TRẢ
1. Số passage đúng 1 hoặc 3; full test có ba passageVersionId khác nhau và số câu liên tục xuyên suốt.
2. Mỗi passage có title, description, ít nhất một section/block và ít nhất một group. Mỗi group có instruction và ít nhất một question.
3. Group order và question number liên tục; mọi ID/option/targetSectionId/gap/anchor/evidence đều trỏ đúng.
4. Mỗi question có một AnswerEntry. Mỗi answer rõ ràng có giải thích riêng. Quote chứng cứ đúng nguyên văn block; NOT GIVEN có thể không có quote.
5. Options/answer ID, word limit, số slots MCQ multiple, reuse rule, table widths, flowchart edges, diagram anchors đều hợp lý theo type.
6. Không tự nhận JSON đã publish-ready nếu `needsReview` còn vấn đề ảnh, OCR, answer key hay asset.
```

## Ví dụ JSON rút gọn: 1 passage có hai dạng

Ví dụ dưới đây cho thấy cách nối `questionId`, đáp án và quote. Khi dùng với đề thật, thay toàn bộ nội dung theo nguồn.

```json
{
  "kind": "single_passage_bundle",
  "passages": [{
    "content": {
      "schemaVersion": 1,
      "passageVersionId": "pv_garden_1",
      "label": "READING PASSAGE 1",
      "title": "The School Garden",
      "description": "A project to bring practical lessons outdoors",
      "sections": [{ "id": "sec_A", "label": "A", "blocks": [
        { "id": "blk_A_1", "kind": "paragraph", "text": "In 2021, Greenfield School built a garden. Students may visit it free of charge at lunch." }
      ] }],
      "questionGroups": [
        {
          "id": "g_tfng", "order": 1, "type": "true_false_not_given",
          "sourceHeading": "Questions 1–2",
          "instructionBlocks": [{ "kind": "instruction", "text": "Do the following statements agree with the information given in the passage?" }],
          "content": { "kind": "question_list" },
          "questions": [
            { "id": "q_1", "number": 1, "prompt": "The garden was built in 2021." },
            { "id": "q_2", "number": 2, "prompt": "Students pay to visit the garden at lunch." }
          ]
        },
        {
          "id": "g_short", "order": 2, "type": "short_answer",
          "sourceHeading": "Question 3",
          "instructionBlocks": [{ "kind": "instruction", "text": "Answer the question below." }, { "kind": "answer_format", "text": "Write NO MORE THAN TWO WORDS." }],
          "settings": { "maxWords": 2, "allowNumber": false },
          "content": { "kind": "question_list" },
          "questions": [{ "id": "q_3", "number": 3, "prompt": "When may students visit the garden?" }]
        }
      ]
    },
    "answerKey": {
      "schemaVersion": 1,
      "passageVersionId": "pv_garden_1",
      "answers": [
        { "questionId": "q_1", "acceptedAnswers": ["TRUE"], "explanation": "Đoạn A ghi năm xây dựng là 2021.", "evidence": [{ "sectionId": "sec_A", "blockId": "blk_A_1", "quote": "In 2021, Greenfield School built a garden." }] },
        { "questionId": "q_2", "acceptedAnswers": ["FALSE"], "explanation": "Đoạn A nói học sinh được vào miễn phí.", "evidence": [{ "sectionId": "sec_A", "blockId": "blk_A_1", "quote": "Students may visit it free of charge at lunch." }] },
        { "questionId": "q_3", "acceptedAnswers": ["at lunch"], "explanation": "Thời điểm được nêu trực tiếp ở đoạn A.", "evidence": [{ "sectionId": "sec_A", "blockId": "blk_A_1", "quote": "at lunch" }] }
      ]
    }
  }],
  "exercise": { "slug": "school-garden", "title": "The School Garden", "description": "A short IELTS Reading exercise about a school garden", "topicIds": [] },
  "needsReview": []
}
```

## Sau khi nhận JSON

1. Kiểm tra `needsReview`; đối chiếu passage, số câu, options, answer key và hình với PDF/ảnh. Nếu AI thiếu trang hoặc đáp án, bổ sung nguồn rồi yêu cầu nó sửa JSON.
2. Lưu JSON ra file UTF-8. Với từng phần tử trong `passages`, gửi **riêng** `{content,answerKey}` tới `POST /api/admin/passages/import`. API sẽ đổi `passageVersionId`; dùng ID mới server trả về khi tạo exercise/full test. Không dùng ID `pv_source_1` của AI để tham chiếu sau import.
3. Với diagram, upload hình qua `/api/admin/assets` và gắn asset ID thật vào draft. Nếu ô nằm trên ảnh, mở admin Preview để chỉnh vị trí anchor; nếu ô nằm dưới ảnh, đối chiếu thứ tự và số câu với số in trên hình.
4. Vào admin, chạy Validate cho từng passage; sửa lỗi rồi mới publish. Sau đó tạo/publish exercise 1 passage hoặc tạo/publish full test bằng các passage đã nhập. Giữ JSON chứa `answerKey` ở phía admin, không đưa lên public API.

Schema chuẩn: [reading.schema.json](reading.schema.json). Ví dụ nhập từng dạng và giải thích thao tác: [HUONG_DAN_NHAP_DE_READING.md](HUONG_DAN_NHAP_DE_READING.md).
