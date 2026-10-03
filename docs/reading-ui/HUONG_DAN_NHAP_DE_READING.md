# Hướng dẫn nhập đề IELTS Reading bằng Reading Admin

Tài liệu này hướng dẫn nhập đề bằng **form trên giao diện**, từ tạo passage đến kiểm tra bài làm. Phần 4 là một bài mẫu hoàn chỉnh 5 câu; **phần 8 có ví dụ nhập tay cho đủ cả 19 dạng câu hỏi**.

## 1. Mở công cụ và hiểu hai luồng

Trong thư mục project `C:\Users\BDPC\Documents\ChatGPT\ielts_space`, chạy:

```powershell
npm install
npm run seed
npm run dev
```

Trước khi chạy, sao chép `.env.example` thành `.env` và tự thay `READING_ADMIN_TOKEN` bằng token riêng. Sau đó mở `http://127.0.0.1:5173/admin/reading` và nhập đúng token vừa cấu hình. Chuỗi `local_admin_reading` trong file mẫu chỉ là placeholder.

- **1 passage:** một bài luyện có một bài đọc và các nhóm câu hỏi. Đây là luồng nên dùng khi mới tập nhập đề.
- **Full test · 3 passages:** một bài thi gồm đúng ba passage versions, chuyển Passage 1/2/3 ở preview và đánh số câu liên tục trên toàn bài.

Các trường bạn nhập được lưu vào SQLite tại `data/reading.sqlite`. Passage và thông tin bài luyện là hai phần lưu riêng. Bản nháp có thể chưa đủ dữ liệu; khi **Xuất bản**, hệ thống mới yêu cầu đủ schema và đáp án.

## 2. Tạo một bài 1 passage

1. Ở Reading Admin, chọn tab **1 passage**, bấm **+ Tạo 1 passage**.
2. Trong **Thông tin**, điền `Exercise title`, `Description`, `Slug` và chọn chủ đề nếu cần. `Slug` là phần cuối của URL học viên, ví dụ `school-garden-project`; không dùng trùng slug của bài khác. Bấm **Lưu thông tin bài luyện**.
3. Sang **Bài đọc**, nhập nhãn, lead-in, title, description và các section A/B/C… Mỗi section có thể có nhiều đoạn bằng **+ Thêm đoạn**. Bấm **Lưu** hoặc chờ chỉ báo **Đã lưu**.
4. Sang **Nhóm câu hỏi**, chọn dạng trong ô **Thêm nhóm câu hỏi**, rồi bấm **+ Thêm nhóm**. Nhập hướng dẫn, câu hỏi và dùng **+ Thêm câu/ô** để tăng số câu tùy ý.
5. Trong từng nhóm, mở **Đáp án & giải thích**. Nhập đáp án đúng và giải thích **cho từng câu**. Dùng **+ Gắn đoạn** nếu có câu văn làm chứng cứ; chọn đoạn A/B/C rồi giữ `Quote` đúng nguyên văn trong đoạn. Câu NOT GIVEN có thể không có quote trực tiếp.
6. Bấm **Preview** để xem như học viên. Chọn đáp án và bấm **Nộp bài** để thử chấm; kết quả hiện số đúng/sai/chưa trả lời. Trong admin preview có thể xem lời giải và bấm **Xem vị trí** để tới đoạn chứng cứ.
7. Sang **Kiểm tra & xuất bản**, bấm **Kiểm tra** và sửa lỗi nếu có. Bấm **Xuất bản passage**, sau đó bấm **Xuất bản exercise** để bài xuất hiện ở danh sách học viên.

> **Lưu ý:** Chỉ xuất bản passage chưa đủ để bài hiện ở trang học viên. Exercise cũng phải được xuất bản. Một passage version đã xuất bản chỉ đọc; muốn sửa hãy bấm **Tạo bản nháp để sửa**. Bản nháp mới có exercise draft và slug mới, không tự thay bài đã công khai.

## 3. Các ô ở đầu mỗi nhóm câu hỏi có nghĩa gì?

- **Loại câu:** dạng câu hỏi; đổi loại sẽ tạo lại cấu trúc nhóm và mất nội dung nhóm cũ, nên chọn trước khi nhập nhiều câu.
- **Thứ tự:** vị trí nhóm trong passage; dùng nút ↑/↓ trên thẻ nhóm để sắp xếp.
- **Instruction:** lệnh đề bài cho **cả nhóm**, ví dụ “Do the following statements agree with the information given in Reading Passage 1?” Đây là ô bắt buộc.
- **Answer format:** cách ghi đáp án, ví dụ “Write TRUE, FALSE or NOT GIVEN in boxes 1–3.” Đây không phải đáp án đúng.
- **NB / lưu ý:** ghi chú của đề gốc, ví dụ “NB You may use any letter more than once.” Chỉ nhập khi đề có.
- **Source heading:** tiêu đề nhóm nếu đề gốc ghi rõ, ví dụ `Questions 1–3`. Để trống thì giao diện tự hiện `Câu hỏi 1–3`. Nếu nhập, số đầu/cuối phải khớp dải câu của nhóm.
- **Tiêu đề nội dung:** tiêu đề phụ nằm trong vùng câu hỏi, nếu dạng đó có. Không phải title của passage.
- **Thứ tự và nhiều dòng hướng dẫn:** mở khi cần nhiều dòng Instruction/Answer format/NB hoặc muốn đổi thứ tự hiển thị.

Các ô văn bản dài có thanh **B**, **I**, **A+**. Bôi chọn một cụm rồi bấm để tô đậm, in nghiêng hoặc tăng cỡ chữ của cụm đó. Tool lưu bằng ký hiệu `**đậm**`, `*nghiêng*`, `^^chữ lớn^^` trong ô nhập; Preview hiển thị định dạng và không hiện ký hiệu. Có thể bấm Enter trong **Instruction**, **Answer format** và **NB / lưu ý**: Preview giữ nguyên dấu xuống dòng. Đoạn passage, mô tả, prompt câu hỏi và phần Text của summary/notes/table/flowchart cũng dùng được định dạng này. Với Sentence Completion, chỉ định dạng chữ ở một bên của marker `[[gap]]`, không bọc marker trong cặp ký hiệu. Khi gắn evidence, chọn quote theo **chữ hiển thị** trong passage, không gồm ký hiệu định dạng.

Không nhập chữ `NONE` vào Answer format hay NB nếu đề không có dòng đó: chữ này sẽ hiện cho học viên. Nếu trước đó đã tạo dòng rồi, mở **Thứ tự và nhiều dòng hướng dẫn** và bấm **×** để xóa hẳn dòng không dùng.

## 4. Ví dụ nhập một bài hoàn chỉnh: The School Garden Project

Ví dụ này gồm passage 2 section, một nhóm True/False/Not Given 3 câu và một nhóm Short Answer 2 câu. Sau khi nhập đúng, preview chấm được **5/5**.

### Bước A — Thông tin bài luyện

- `Exercise title`: `The School Garden Project`
- `Description`: `A short reading practice about a school garden.`
- `Slug`: `school-garden-project` (đổi nếu slug đã tồn tại)
- Chủ đề: có thể chọn `Nature` hoặc `Environment`

Bấm **Lưu thông tin bài luyện**.

### Bước B — Bài đọc

- `Nhãn bài đọc`: `READING PASSAGE 1`
- `Lead-in`: `You should spend about 20 minutes on Questions 1–5.`
- `Title`: `The School Garden Project`
- `Description dưới title`: `How students turned an unused space into a place to learn.`

**Section A**, một đoạn `paragraph`:

> In 2021, Greenfield School turned an unused courtyard into a small garden. Students grow tomatoes and herbs there. The garden is free for all students to visit during lunch.

Bấm **+ Thêm section** để tạo **Section B**, một đoạn `paragraph`:

> A rainwater tank supplies water during dry weeks. Volunteers teach a gardening class every Friday. Students use the harvest in cooking lessons. The headteacher believes the garden makes science lessons more practical. She does not want it to replace classroom teaching.

Bấm **Lưu**. Đừng đổi chữ trong hai đoạn sau khi đã gắn quote ở đáp án, vì validator sẽ báo chứng cứ không còn khớp.

### Bước C — Nhóm 1: True / False / Not Given

Chọn loại `True / False / Not Given`, bấm **+ Thêm nhóm**, rồi bấm **+ Thêm câu/ô** thêm hai lần để có **câu 1–3**.

- `Instruction`: `Do the following statements agree with the information given in Reading Passage 1?`
- `Answer format`: `Write TRUE, FALSE or NOT GIVEN in boxes 1–3.`
- `NB / lưu ý`: để trống
- `Source heading`: để trống, hoặc nhập `Questions 1–3`

Trong tab **Nội dung**, nhập ba `Statement`:

1. `Greenfield School created the garden in 2021.`
2. `Students must pay to visit the garden at lunch.`
3. `The school will sell tomatoes next year.`

Trong tab **Đáp án & giải thích**:

1. Chọn `TRUE`. Giải thích: `The passage says the courtyard became a garden in 2021.` Gắn Section A; quote: `In 2021, Greenfield School turned an unused courtyard into a small garden.`
2. Chọn `FALSE`. Giải thích: `The garden is free for students to visit at lunch.` Gắn Section A; quote: `The garden is free for all students to visit during lunch.`
3. Chọn `NOT GIVEN` (có dấu cách). Giải thích: `The passage mentions tomatoes but gives no plan to sell them next year.` Không cần gắn chứng cứ trực tiếp cho câu này.

Ô đáp án TF/NG hiện là danh sách chọn. Dữ liệu cũ viết `NOTGIVEN` vẫn được backend hiểu như `NOT GIVEN` khi kiểm tra và chấm.

### Bước D — Nhóm 2: Short Answer

Chọn `Short Answer`, bấm **+ Thêm nhóm**, rồi thêm một câu nữa để có **câu 4–5**.

- `Instruction`: `Answer the questions below.`
- `Answer format`: `Write NO MORE THAN TWO WORDS for each answer.`
- Trong tab **Nội dung**, đặt `Số từ tối đa` là `2`; bỏ chọn `Cho phép số`.

Nhập hai `Question prompt`:

4. `What supplies water during dry weeks?`
5. `On which day do volunteers teach a gardening class?`

Trong **Đáp án & giải thích**:

4. Đáp án: `rainwater tank`. Giải thích: `The tank supplies the water.` Gắn Section B; quote: `A rainwater tank supplies water during dry weeks.`
5. Đáp án: `Friday`. Giải thích: `The class takes place every Friday.` Gắn Section B; quote: `Volunteers teach a gardening class every Friday.`

Với câu gõ từ, có thể thêm nhiều biến thể hợp lệ bằng dấu `|`, ví dụ `Friday | friday`. Backend bỏ qua khác biệt chữ hoa/thường và khoảng trắng thừa. Chỉ thêm biến thể thật sự đúng theo đề.

### Bước E — Xem thử, kiểm tra và xuất bản

1. Bấm **Lưu**, tải lại trang một lần để chắc nội dung vẫn còn.
2. Bấm **Preview**. Ở panel phải, đổi nhóm câu bằng menu cạnh tiêu đề hoặc bấm số câu ở footer.
3. Thử trả lời `TRUE`, `FALSE`, `NOT GIVEN`, `rainwater tank`, `Friday`; bấm **Nộp bài**. Kết quả mong đợi: **5/5 đúng**. Bấm phần lời giải và **Xem vị trí** để kiểm tra quote.
4. Quay lại admin, bấm **Kiểm tra**. Nếu không có lỗi, bấm **Xuất bản passage** rồi **Xuất bản exercise**.
5. Mở `http://127.0.0.1:5173/reading/passages`, tìm bài theo title hoặc chủ đề. URL trực tiếp là `/reading/preview/passage/school-garden-project` nếu bạn dùng slug ví dụ trên.

## 5. Nhập Full test 3 passages

1. Ở dashboard, chọn **Full test · 3 passages**, bấm **+ Tạo full test**.
2. Nhập `Title`, `Description`, `Slug`, `Thời gian (phút)`, rồi bấm **Lưu**.
3. Với Passage 1/2/3, bấm **+ Tạo passage mới** để vào cùng editor như phần trên. Cách này tự bắt đầu dải số câu theo vị trí trong test. Có thể **Chọn passage version** đã có nếu số câu của passage ấy đã đúng dải liên tục.
4. Nhập đủ ba passage, quay về full test, bấm **Preview toàn bài** để kiểm tra chuyển Passage 1/2/3 và footer số câu.
5. Bấm **Kiểm tra**; full test chỉ hợp lệ khi có đúng ba passage versions khác nhau, câu hỏi được đánh số liên tục từ Passage 1 đến Passage 3 và tất cả đáp án hợp lệ. Sau đó bấm **Xuất bản**.

Passage hoặc full test đã xuất bản không được sửa trực tiếp. Khi cần cập nhật nội dung, tạo bản nháp/version mới; đề đang công khai vẫn dùng bản cũ cho đến khi bạn xuất bản bài mới.

## 6. Những lỗi thường gặp

- **Bấm Lưu thấy “Published version is immutable”:** bạn đang mở version đã xuất bản. Bấm **Tạo bản nháp để sửa** rồi chỉnh ở bản mới.
- **Preview có nội dung nhưng trang học viên chưa thấy bài:** kiểm tra cả passage **và exercise** đã publish chưa.
- **Validator báo thiếu đáp án/giải thích:** mở **Đáp án & giải thích** và điền cho từng câu, kể cả từng ô trống.
- **Validator báo quote cũ:** quote phải là đoạn chữ còn tồn tại nguyên văn trong passage; chọn lại đoạn rồi rút quote ngắn hơn nếu cần.
- **Source heading sai dải:** sửa số trong heading cho khớp số câu hiện tại, hoặc xóa để hệ thống tự tạo.
- **Answer format/NB hiện chữ `NONE`:** xóa dòng đó trong **Thứ tự và nhiều dòng hướng dẫn**.
- **Bấm Nộp bài nhưng điểm chưa hiện:** đảm bảo API local ở cổng 3001 đang chạy cùng `npm run dev`; kiểm tra thông báo lỗi trên panel câu hỏi.

## 7. Dữ liệu được lưu ở đâu?

- Đề, câu hỏi, đáp án và trạng thái publish: SQLite file `data/reading.sqlite`.
- Ảnh sơ đồ upload: thư mục `uploads/`.
- Câu trả lời đang làm của học viên: `sessionStorage` trong tab trình duyệt. Server chấm khi bấm **Nộp bài**, nhưng hiện **chưa lưu lịch sử attempt/điểm** vào database.

Các script test trong project hiện có thể tạo bản ghi thử trong cùng database local. Hướng dẫn cấu hình database riêng nằm ở [README.md](../../README.md).

## 8. Ví dụ nhập tay cho đủ 19 dạng câu hỏi

Các ví dụ dưới đây dùng **Section A và B của bài The School Garden Project ở phần 4**. Mỗi mục là một mẫu nhóm độc lập: bạn có thể tạo một passage nháp mới rồi thử từng dạng, hoặc thêm nhiều nhóm vào một passage. Nếu thêm nhiều nhóm, **không tự gõ số câu cố định trong câu hỏi**; số câu trên form sẽ tự chạy tiếp. Với `Source heading` và `Answer format`, sửa dải số theo số đang hiện trên form. Mỗi câu/ô đều cần **Đáp án đúng** và **Giải thích riêng**; ví dụ quote bên dưới chỉ rõ đoạn để gắn chứng cứ. Ký hiệu `[ô]` trong tài liệu là ô gap của editor, **không phải chuỗi cần gõ vào Text**.

### 8.1 True / False / Not Given (`true_false_not_given`)

- Chọn loại **True / False / Not Given**. `Instruction`: `Do the following statements agree with the information given in the passage?`
- Trong **Nội dung**, thêm ba `Statement`: `The garden was created in 2021.`; `Students pay to visit the garden at lunch.`; `The school will sell tomatoes next year.`
- Trong **Đáp án & giải thích**, chọn lần lượt `TRUE`, `FALSE`, `NOT GIVEN`. Giải thích lần lượt: năm 2021 được nêu rõ; đoạn A nói miễn phí; passage không nói kế hoạch bán cà chua. Gắn quote `In 2021, Greenfield School turned an unused courtyard into a small garden.` cho câu đầu, `The garden is free for all students to visit during lunch.` cho câu hai. Câu NOT GIVEN có thể để trống chứng cứ.

### 8.2 Yes / No / Not Given (`yes_no_not_given`)

- Chọn loại **Yes / No / Not Given** cho phát biểu về **quan điểm** của headteacher, không dùng TRUE/FALSE.
- Nhập ba `Statement`: `The headteacher believes the garden makes science lessons more practical.`; `The headteacher wants the garden to replace classroom teaching.`; `The headteacher thinks every student should visit daily.`
- Đáp án lần lượt `YES`, `NO`, `NOT GIVEN`. Giải thích: ý đầu được nói trực tiếp; ý hai trái với mong muốn của headteacher; ý ba không được nêu. Quote cho YES là `The headteacher believes the garden makes science lessons more practical.`; cho NO là `She does not want it to replace classroom teaching.`

### 8.3 Multiple Choice · Single (`multiple_choice_single`)

- Trong một câu, nhập `Prompt`: `What supplies water during dry weeks?`
- Ở **Options riêng của câu**, nhập `A` → `A rainwater tank`, `B` → `A nearby river`, `C` → `A school swimming pool`.
- Đáp án là **ID `A`**, không nhập cả câu chữ. Giải thích: passage nêu bồn chứa nước mưa. Quote Section B: `A rainwater tank supplies water during dry weeks.` Muốn thêm một MCQ khác, bấm **+ Thêm câu/ô**; mỗi câu có options riêng.

### 8.4 Multiple Choice · Multiple (`multiple_choice_multiple`)

- Nhập `Prompt chung`: `Which TWO activities are mentioned in the passage?`
- Đặt `Số đáp án phải chọn` là `2`; nhóm phải có **2 answer slots**. Nếu đang có 1 slot, bấm **+ Thêm câu/ô** một lần.
- `Danh sách lựa chọn`: `A` → `Growing tomatoes`, `B` → `A gardening class`, `C` → `Selling vegetables`, `D` → `Playing football`.
- Ở hai box đáp án, nhập ID `A` và `B`. Giải thích riêng cho từng slot: đoạn A nói trồng cà chua; đoạn B nói lớp làm vườn. Quote tương ứng `Students grow tomatoes and herbs there.` và `Volunteers teach a gardening class every Friday.` Backend chấm theo **tập không thứ tự**: chọn B rồi A vẫn được 2/2; chọn A hai lần không được tính hai điểm.

### 8.5 Matching Headings (`matching_headings`)

- Trong **Danh sách heading**, nhập `i` → `How the garden began`, `ii` → `Water and lessons`, `iii` → `A plan to sell produce`.
- Tạo hai câu. Ở `Đoạn mục tiêu`, chọn **Section A** cho câu đầu và **Section B** cho câu hai.
- Đáp án lần lượt là ID `i`, `ii`. Giải thích: A nói nguồn gốc khu vườn; B nói nguồn nước và lớp học. Có thể gắn quote mở đầu Section A/B để học viên bấm **Xem vị trí**. Heading `iii` là phương án dư.

### 8.6 Matching Information (`matching_information`)

- Trong **Options chung**, nhập `A` → `Section A`, `B` → `Section B`. `Cho phép dùng lại option`: chọn **Có thể dùng lại** nếu đề cho phép một đoạn trả lời nhiều câu; nếu chọn **Không dùng lại**, không dùng cùng ID hai lần trong đáp án.
- `Prompt / statement` câu 1: `Students can visit the garden at lunch without paying.`; câu 2: `A class takes place at the end of each week.`
- Đáp án `A`, `B`. Giải thích bằng quote `The garden is free for all students to visit during lunch.` và `Volunteers teach a gardening class every Friday.`

### 8.7 Matching Features (`matching_features`)

- Trong **Tên danh sách / features**, nhập `A` → `Greenfield School`, `B` → `Volunteers`, `C` → `Local shops`.
- Nhập hai `Prompt / statement`: `Turned an unused courtyard into a garden.` và `Teach a gardening class every Friday.`
- Đáp án `A`, `B`. Giải thích: nhà trường chuyển đổi sân; tình nguyện viên dạy lớp. Quote: `Greenfield School turned an unused courtyard into a small garden.` và `Volunteers teach a gardening class every Friday.` Nếu đề có NB cho phép lặp lựa chọn, chọn **Có thể dùng lại** và ghi NB nhất quán.

### 8.8 Matching Sentence Endings (`matching_sentence_endings`)

- Trong **Options chung**, nhập `A` → `free for students to visit during lunch.`, `B` → `every Friday.`, `C` → `sold to local shops.`
- Ở `Beginning`, nhập `The garden is` và `Volunteers teach a gardening class`.
- Đáp án lần lượt `A`, `B`; `C` là phần kết dư. Giải thích và quote lấy từ câu về miễn phí ở Section A và lớp học thứ Sáu ở Section B. Trong answer box, nhập **ID**, không nhập cả phần kết.

### 8.9 Sentence Completion (`sentence_completion`)

- Đặt `Số từ tối đa` là `1`. Trong `Sentence`, nhập đúng marker `[[gap]]`: `Volunteers teach a gardening class every [[gap]].`
- Đáp án `Friday`. Giải thích: lớp học diễn ra vào thứ Sáu. Quote Section B: `Volunteers teach a gardening class every Friday.` Marker `[[gap]]` là cú pháp riêng của **Sentence Completion**; không dùng nó để tạo gap ở Summary/Notes/Table/Flowchart.

### 8.10 Short Answer (`short_answer`)

- Đặt `Số từ tối đa` là `2`. `Question prompt`: `What supplies water during dry weeks?`
- Đáp án `rainwater tank`. Giải thích và quote Section B: `A rainwater tank supplies water during dry weeks.` Nếu có nhiều cách trả lời hợp lệ, nhập dạng `rainwater tank | water tank` trong ô đáp án, nhưng chỉ khi cả hai thật sự đúng theo đề.

### 8.11 Summary · Text (`summary_completion_text`)

- `Tiêu đề nội dung`: `A new garden`. `Số từ tối đa`: `1`.
- Trong block `paragraph`, bố trí các phần: Text `In 2021, the school turned an unused ` → **gap hiện có** → Text ` into a small garden.` Dùng **+ Text** nếu cần phần chữ sau gap. Preview hiện: “In 2021, the school turned an unused [ô] into a small garden.”
- Đáp án ô đó: `courtyard`. Giải thích: passage nói sân chưa dùng được chuyển thành vườn. Quote Section A: `Greenfield School turned an unused courtyard into a small garden.`

### 8.12 Notes · Text (`note_completion_text`)

- `Tiêu đề nội dung`: `Garden notes`. `Số từ tối đa`: `2`.
- Trong block `heading`, nhập Text `The school garden`. Trong block `bullet`, nhập Text `Water source: ` rồi giữ **gap hiện có**. Preview hiện một bullet “Water source: [ô]”.
- Đáp án `rainwater tank`. Giải thích và quote Section B: `A rainwater tank supplies water during dry weeks.` Có thể thêm `subheading` hoặc bullet level 2 nếu ghi chú của đề có nhiều tầng.

### 8.13 Table · Text (`table_completion_text`)

- `Tiêu đề nội dung`: `Project facts`. Đặt `Số từ tối đa` là `2`.
- Tạo bảng **2 cột**: hàng đầu là header `Feature` | `Detail`; hàng dữ liệu là `Water source` | **gap**. Dùng **+ Cột**; ở ô hàng dữ liệu cột 1, xóa gap mặc định bằng **×** rồi thêm Text `Water source`; ở cột 2, dùng **+ Ô trống** để chuyển gap sang đúng ô. Sửa Text ở hàng đầu và giữ số cột bằng nhau ở mọi hàng.
- Đáp án ô gap: `rainwater tank`. Giải thích và quote Section B: `A rainwater tank supplies water during dry weeks.`

### 8.14 Flowchart · Text (`flowchart_completion_text`)

- `Tiêu đề nội dung`: `From courtyard to garden`. `Số từ tối đa`: `1`.
- Bước 1: Text `The school converts an unused ` → gap hiện có. Thêm Bước 2: Text `Students grow tomatoes and herbs.` Ở Bước 1 chọn `Mũi tên tới bước` = Bước 2.
- Đáp án gap Bước 1: `courtyard`. Giải thích và quote Section A: `Greenfield School turned an unused courtyard into a small garden.` Mũi tên phải trỏ đến một bước đang tồn tại.

### 8.15 Diagram · Text (`diagram_completion_text`)

- **Vị trí ô trả lời** có hai cách. Chọn **Ô trả lời đặt trên ảnh** khi ảnh sạch, rồi kéo ô và điểm nối trên ảnh. Chọn **Ảnh đã in sẵn số/đường dẫn; ô trả lời nằm bên dưới ảnh** khi đề gốc đã ghi số và nét chỉ dẫn như ví dụ Falkirk Wheel. Với cách thứ hai, upload nguyên ảnh, thêm đúng số câu/ô, giữ thứ tự số như nguồn; Preview đặt các ô nhập bên dưới ảnh và không vẽ thêm ô/đường lên ảnh. Có thể điền gợi ý riêng bên cạnh từng ô, hoặc để trống nếu ảnh đã đủ lời dẫn.
- Trong **Upload SVG/PNG/JPEG**, có thể dùng ảnh minh họa local `server/assets/rain-system.svg` để thử. Ảnh này chỉ là asset demo; khi nhập đề thật, upload sơ đồ của đề.
- Sau khi upload, chọn **Ô 1/2/3** trong danh sách dưới ảnh rồi bấm lên ảnh để đặt vị trí, hoặc kéo nhãn ô trên ảnh. Phím mũi tên chỉnh 1%; giữ **Shift** chỉnh 5%. X/Y cập nhật tự động và vẫn có thể nhập số để chỉnh chính xác. Bấm **Lưu → Preview** để xem ô trả lời thật của học viên.
- `Tiêu đề sơ đồ`: `Rainwater collection`; `Alt text`: `A roof directs water into a storage tank.` Đặt `Số từ tối đa` là `2`.
- Với ô gap đầu tiên, đặt `X % = 50`, `Y % = 76` để thử vị trí gần bồn chứa; `Nhãn` có thể là `Water storage`. X/Y là phần trăm trên ảnh, phải nằm trong **0–100**. Kéo lại bằng cách sửa hai số rồi xem Preview.
- Đáp án `rainwater tank`. Giải thích và quote Section B: `A rainwater tank supplies water during dry weeks.`
- Bản nháp minh họa cách thứ hai dùng ảnh người dùng cung cấp ở `docs/reading-ui/examples/falkirk-wheel-numbered.png`, câu 20–26. Mở `/admin/reading/preview/passage/pv_61ea5fc16893` để xem. Ảnh chưa kèm passage và đáp án gốc nên bản nháp này **chưa đủ điều kiện publish**; không tự đoán đáp án từ hình.

### 8.16 Summary · Word Box (`summary_completion_word_box`)

- `Tiêu đề nội dung`: `The school garden`. Trong block paragraph: Text `The school turned an unused ` → gap → Text ` into a garden.`
- Ở **Hộp từ / option bank**, nhập `A` → `courtyard`, `B` → `river`, `C` → `classroom`. Chọn `Cho phép dùng lại` theo đúng đề.
- Đáp án là **ID `A`**, không phải chữ `courtyard`. Giải thích và quote Section A: `Greenfield School turned an unused courtyard into a small garden.`

### 8.17 Notes · Word Box (`note_completion_word_box`)

- `Tiêu đề nội dung`: `Water notes`. Block `heading`: Text `The garden`; block `bullet`: Text `Water source: ` → gap.
- Hộp từ: `A` → `rainwater tank`, `B` → `nearby river`, `C` → `swimming pool`.
- Đáp án **ID `A`**. Giải thích và quote Section B: `A rainwater tank supplies water during dry weeks.` Word Box chấm theo ID của lựa chọn, không theo giới hạn số từ.

### 8.18 Table · Word Box (`table_completion_word_box`)

- `Tiêu đề nội dung`: `Garden facts`. Tạo bảng 2 cột với header `Feature` | `Detail`; hàng dữ liệu `Class day` | gap. Nếu gap mặc định nằm ở cột 1, xóa gap đó rồi dùng **+ Ô trống** tại cột 2 như ví dụ Table · Text.
- Hộp từ: `A` → `Friday`, `B` → `Monday`, `C` → `Sunday`. Đáp án **ID `A`**.
- Giải thích và quote Section B: `Volunteers teach a gardening class every Friday.` Giữ các hàng cùng số cột và hàng đầu có ô được đánh dấu `Header`.

### 8.19 Flowchart · Word Box (`flowchart_completion_word_box`)

- `Tiêu đề nội dung`: `Garden routine`. Bước 1: Text `Volunteers teach a class every ` → gap; Bước 2: Text `Students use the harvest in cooking lessons.` Chọn mũi tên Bước 1 → Bước 2.
- Hộp từ: `A` → `Friday`, `B` → `Tuesday`, `C` → `December`. Đáp án **ID `A`**.
- Giải thích và quote Section B: `Volunteers teach a gardening class every Friday.` Dạng này dùng bố cục Flowchart và cách chọn đáp án của Word Box.

### Cách tự kiểm tra từng ví dụ

Với mỗi dạng, nhập ít nhất một câu/ô như trên, mở **Đáp án & giải thích**, nhập lời giải và quote, rồi bấm **Lưu → Preview → Nộp bài → Kiểm tra**. Trong Preview, câu chọn/gõ đúng phải được tính đúng; câu sai hoặc bỏ trống hiện trạng thái tương ứng. Chỉ bấm **Xuất bản** khi validator không còn lỗi. Danh mục bắt buộc có **19 dạng**; `diagram_completion_word_box` không nằm trong danh mục này.
