import http from '@/api/http'

const unmountMedia = (serverUuid: string, mediaUuid: string) => {
    return http.post(`/api/client/servers/${serverUuid}/settings/hardware/media/${mediaUuid}/unmount`)
}

export default unmountMedia
