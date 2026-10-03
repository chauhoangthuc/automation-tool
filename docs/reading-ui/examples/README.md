# Mẫu Diagram Completion

Sơ đồ mẫu: `rainwater-collection-diagram.svg`. Script `scripts/create-diagram-demo.mjs` upload ảnh thật vào backend, tạo passage + exercise **draft**, ba ô trả lời và đáp án/chứng cứ riêng từng câu. Script kiểm tra slug trước khi tạo để chạy lại không nhân bản bài.

Khi API local đang chạy, thực hiện ở thư mục gốc:

```powershell
node scripts/create-diagram-demo.mjs
node tests/diagram-demo-preview.mjs
```

Script thứ nhất in `passageVersionId`. Mở `/admin/reading/passages/<passageVersionId>/edit`, chọn ô dưới ảnh rồi **bấm hoặc kéo nhãn trực tiếp trên ảnh** để đặt vị trí. Chọn **Đặt điểm nối** để bấm lên chi tiết sơ đồ hoặc kéo chấm tròn ở đầu đường nối. Đường nối tự đi theo hai điểm này khi chỉnh vị trí. Phím mũi tên chỉnh 1%, Shift + mũi tên chỉnh 5%. X/Y vẫn có thể nhập bằng số. Mở `/admin/reading/preview/passage/<passageVersionId>` để xem bố cục học viên. Script thứ hai chụp `screenshots/diagram-demo-preview.png` và `screenshots/diagram-demo-editor.png`, kiểm tra ba ô nằm trên ảnh và thử chấm đúng 3/3 với bài mẫu nguyên bản. Bài mẫu vẫn là draft, không xuất hiện ở danh sách học viên.

Với bài mẫu đã tạo trước đây, chạy `node scripts/upgrade-diagram-demo-connectors.mjs` để thay ảnh cũ có đường tím cố định bằng ảnh sạch và thêm điểm nối động. Script giữ nguyên các câu và tọa độ ô đã chỉnh. Nếu bạn đã thêm câu mới, hãy đặt điểm nối cho câu đó trong editor nếu muốn hiện đường dẫn.

Để thêm một ô có đường nối: bấm **+ Thêm câu/ô**, chọn ô mới trong danh sách ngay dưới ảnh, kéo ô đến vị trí mong muốn, rồi bấm **+ Tạo đường nối ô N**. Bấm lên chi tiết trong sơ đồ để đặt đầu đường; có thể kéo chấm tròn và ô để canh lại. **Bỏ đường nối ô N** chỉ xóa đường; **Xóa ô N** bên dưới xóa cả câu, ô, đáp án và đường nối sau khi xác nhận. Cuối cùng bấm **Lưu**.
