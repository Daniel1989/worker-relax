import { SERVER_HOST } from "./constant"

export const formatTime = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return (
    [year, month, day].map(formatNumber).join('/') +
    ' ' +
    [hour, minute, second].map(formatNumber).join(':')
  )
}

const formatNumber = (n: number) => {
  const s = n.toString()
  return s[1] ? s : '0' + s
}


export const request = (req: {
  path: string,
  method?: 'GET' | 'POST',
  data?: any,
  success?: (res:any)=>void,
  fail?: (res:any)=>void,
  complete?: (res: any) => void
}) => {
  const { path, method = 'GET', data = {}, success, fail, complete} = req;
  return wx.request({
    url: SERVER_HOST + path,
    method,
    data: data,
    dataType: "json",
    success:  (res) => {
      success && success(res.data)
    },
    fail: (err) => {
      fail && fail(err)
    },
    complete: (res) => {
      complete && complete(res)
    }
  })
}