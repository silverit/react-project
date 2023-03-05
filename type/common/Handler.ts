export interface TypeResponse {
  data: object;
  status: "fail" | "success";
  statusCode: string;
}
export interface ResponseHandler {
  success: (res: TypeResponse) => void;
  fail: (res: TypeResponse) => void;
}
