import {ZOHO_API_URL} from "$env/static/private";

export const httpService = {
    get: async (url, request) => {
        const response = await fetch(url, {
            method: 'GET',
            headers: {'Authorization': `Bearer ${request.cookies.get('zoho-access-token')}`}
        })
        return await response.json()
    }
}

export const Portal = {
    fetchAll: async (request) => {
        const response = await httpService.get(`${ZOHO_API_URL}/portals/`, request)
        return response.portals ?? []
    }
}

export const Project = {
    fetchAll: async (request, portalId) => {
        const response = await httpService.get(`${ZOHO_API_URL}/portal/${portalId}/projects/`, request)
        return response.projects ?? []
    },
    searchTasks: async (request, portalId, projectId, index, range, searchTerm) => {
        const url = `${ZOHO_API_URL}/portal/${portalId}/projects/${projectId}/search?index=${index}&range=${range}&search_term=${searchTerm}&module=tasks`
        const response = await httpService.get(url, request)
        return response.tasks ?? []
    }
}

export const Task = {
    fetchAll: async (request, portalId, projectId) => {
        const response = await httpService.get(`${ZOHO_API_URL}/portal/${portalId}/projects/${projectId}/tasks/`, request)
        return response.tasks ?? []
    }
}

export const SubTask = {
    fetchAll: async (request, portalId, projectId, taskid) => {
        const response = await httpService.get(`${ZOHO_API_URL}/portal/${portalId}/projects/${projectId}/tasks/${taskid}/subtasks/`, request)
        return response.tasks ?? []
    }
}