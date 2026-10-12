# FPT LearnWithMe

Nền tảng ôn tập trắc nghiệm cho sinh viên FPT. Hỗ trợ nhiều môn học, phân chia theo học kỳ (Spring26, Summer26, Fall26…), câu hỏi một đáp án hoặc nhiều đáp án, thêm thủ công hoặc import Excel/JSON.

## Tính năng

- Trang chủ liệt kê các môn học theo học kỳ
- Làm bài trắc nghiệm: 1 đáp án hoặc nhiều đáp án, xáo trộn câu hỏi & đáp án
- Hiển thị đáp án đúng/sai ngay sau mỗi câu (có thể tắt)
- Trang admin ẩn (`/admin`) với đăng nhập bằng mật khẩu
- Admin có thể: thêm/sửa/xóa môn, thêm câu hỏi thủ công, import Excel (.xlsx) hoặc JSON, xuất JSON để commit lên repo
- Giao diện glassmorphism, nền tối xanh biển, accent xanh lá & vàng
- Lưu tiến độ & cài đặt của người dùng trong `localStorage` (riêng từng trình duyệt)

## Cài đặt

```bash
npm install
npm run dev
```

Mở `http://localhost:5173`.

## Deploy lên Vercel

1. Đẩy repo lên GitHub
2. Trên Vercel: New Project → import repo
3. Framework preset: **Vite** (đã có `vercel.json`)
4. Bấm Deploy

Mỗi lần admin cập nhật dữ liệu, copy file JSON mới từ trang admin rồi commit lên repo (`public/data/...`) để mọi người dùng đều thấy.

## Cấu trúc dữ liệu

### `public/data/subjects.json`

```json
{
  "subjects": [
    {
      "id": "swt301",
      "name": "Software Testing",
      "icon": "🧪",
      "description": "Ôn tập môn Kiểm thử phần mềm"
    }
  ]
}
```

### `public/data/{subjectId}/{semesterId}.json`

```json
{
  "subjectId": "swt301",
  "semester": "Spring26",
  "questions": [
    {
      "id": "q1",
      "type": "single",
      "question": "TestNG là viết tắt của?",
      "options": ["Test Next Generation", "Testing New Group", "Test Node G", "Test Number G"],
      "correct": [0],
      "explanation": "TestNG = Test Next Generation."
    },
    {
      "id": "q2",
      "type": "multiple",
      "question": "Các mức kiểm thử gồm:",
      "options": ["Unit", "Integration", "System", "Compilation"],
      "correct": [0, 1, 2],
      "explanation": "Có 4 mức: Unit, Integration, System, Acceptance."
    }
  ]
}
```

## Import Excel (nâng cao)

Cột trong file Excel (header ở dòng 1):

| Cột | Mô tả |
|-----|--------|
| `question` | Nội dung câu hỏi |
| `option1` .. `option6` | Các lựa chọn (tối đa 6) |
| `type` | `single` hoặc `multiple` |
| `correct` | VD: `1` hoặc `1,3,4` |
| `explanation` | (tuỳ chọn) giải thích đáp án |

## Trang admin

- URL: `/admin` (ẩn, không có link ở UI người dùng)
- Mật khẩu mặc định: `fptlearn` — đổi trong `src/data/adminConfig.js`
- Đăng nhập thành công có hiệu lực trong phiên trình duyệt

## License

MIT