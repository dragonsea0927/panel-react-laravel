import {
    AdminServerBuild,
    rawDataToAdminServer,
} from '@/api/admin/servers/getServer'
import http, { PaginatedResult, getPaginationSet } from '@/api/http'

export type ServerInclude = 'user' | 'node'

export interface QueryParams {
    nodeId?: number
    userId?: number
    query?: string
    page?: number
    perPage?: number
    include?: ServerInclude[]
}

export type ServerResponse = PaginatedResult<AdminServerBuild>

const getServers = async ({
    nodeId,
    userId,
    query,
    perPage = 50,
    include,
    ...params
}: QueryParams): Promise<ServerResponse> => {
    const { data } = await http.get('/api/admin/servers', {
        params: {
            'filter[node_id]': nodeId,
            'filter[user_id]': userId,
            'filter[*]': query,
            'include': include?.join(','),
            'per_page': perPage,
            ...params,
        },
    })

    return {
        items: data.data.map(rawDataToAdminServer),
        pagination: getPaginationSet(data.meta.pagination),
    }
}

export default getServers