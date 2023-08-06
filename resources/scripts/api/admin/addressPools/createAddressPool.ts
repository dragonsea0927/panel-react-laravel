import http from '@/api/http'
import { rawDataToAddressPool } from '@/api/admin/addressPools/getAddressPools'

interface CreateAddressParameters {
    name: string
    nodeIds?: number[] | string[]
}

const createAddressPool = async ({ name, nodeIds }: CreateAddressParameters) => {
    const {
        data: { data },
    } = await http.post('/api/admin/address-pools', {
        name,
        node_ids: nodeIds,
    })

    return rawDataToAddressPool(data)
}

export default createAddressPool
