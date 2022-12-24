export const httpService = {
    get: async (url) => {
        const response = await fetch(url, {
            method: 'GET'
        })
        return await response.json()
    }
}

export const Project = {
    fetchAll: async (portalId) => {
        const response = await httpService.get(`/api/portals/${portalId}/projects`)
        return response.data ?? []
    }
}

export const Portal = {
    fetchAll: async () => {
        const response = await httpService.get(`/api/portals/`)
        return response.data ?? []
    }
}