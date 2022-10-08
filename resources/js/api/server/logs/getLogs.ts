import axios from 'axios'

export interface Log {
  pstart: number
  id: string
  user: string
  upid: string
  status: string
  type: string
  pid: number
  node: string
  starttime: number
  endtime: number
}

export default (serverUuid: string) => {
  return axios.get<Log[]>(route('servers.show.logs.json', serverUuid))
}
