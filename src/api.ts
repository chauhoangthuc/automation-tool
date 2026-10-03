export const token=()=>sessionStorage.getItem('reading-admin-token')||'';
export async function api<T=unknown>(path:string,init:RequestInit={},admin=false):Promise<T>{
 const headers=new Headers(init.headers);if(init.body&&typeof init.body==='string')headers.set('Content-Type','application/json');if(admin)headers.set('x-admin-token',token());
 let res:Response;try{res=await fetch('/api'+path,{...init,headers})}catch{throw new Error('Không kết nối được server. Hãy kiểm tra npm run dev rồi thử lại.')}
 let data:{error?:string;issues?:unknown}|T;try{data=await res.json()}catch{throw new Error(res.ok?'Server trả dữ liệu không đọc được.':'Server gặp lỗi nhưng không trả chi tiết.')}
 if(!res.ok){const body=data as {error?:string;issues?:unknown};const fallback=res.status===401?'Phiên admin không hợp lệ. Hãy nhập lại admin token.':res.status===413?'File quá lớn so với giới hạn cho phép.':res.status>=500?'Server hoặc dịch vụ AI đang gặp sự cố. Hãy thử lại sau.':'Dữ liệu gửi lên chưa hợp lệ.';throw Object.assign(new Error(body.error||fallback),{issues:body.issues,status:res.status})}return data as T;
}
export const post=<T>(path:string,data:unknown,admin=true)=>api<T>(path,{method:'POST',body:JSON.stringify(data)},admin);
export const patch=<T>(path:string,data:unknown)=>api<T>(path,{method:'PATCH',body:JSON.stringify(data)},true);
