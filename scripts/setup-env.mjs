import {copyFileSync,existsSync} from 'node:fs';

if(existsSync('.env')){
 console.log('.env đã tồn tại; không ghi đè.');
}else{
 copyFileSync('.env.example','.env');
 console.log('Đã tạo .env. Hãy điền GEMINI_API_KEY và thay READING_ADMIN_TOKEN trước khi chạy server.');
}
