import {ZOHO_API_URL} from "$env/static/private";

export const httpService = {
    get: async (url, request) => {
        const response = await fetch(url, {
            method: 'GET',
            headers: {'Authorization': `Bearer ${request.cookies.get('zoho-access-token')}`}
        })
        return response.body ? await response.json() : ''
    },
    post: async (url, postData = {}, request) => {
        const response = await fetch(url, {
            method: 'POST',
            headers: {'Authorization': `Bearer ${request.cookies.get('zoho-access-token')}`},
            body: JSON.stringify(postData)
        })
        return response.body ? await response.json() : ''
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
    },
    fetchMyTasks: async (request, portalId, projectId) => {
        const response = await httpService.get(`${ZOHO_API_URL}/portal/${portalId}/mytasks/?project_ids=${projectId}&status=open`, request)
        return response.tasks ?? []
    }
}

export const SubTask = {
    fetchAll: async (request, portalId, projectId, taskId) => {
        const response = await httpService.get(`${ZOHO_API_URL}/portal/${portalId}/projects/${projectId}/tasks/${taskId}/subtasks/`, request)
        return response.tasks ?? []
    }
}

export const Timesheet = {
    addLogWithTaskId: async (request, portalId, projectId, taskId, timeLog) => {
        const response = await httpService.post(
            `${ZOHO_API_URL}/portal/${portalId}/projects/${projectId}/tasks/${taskId}/logs/?date=${timeLog.date}&bill_status=${timeLog.billStatus}&hours=${timeLog.hours}&notes=${timeLog.note}`,
            {},
            request
        )
        return response.tasks ?? []
    },
    addGeneralLog: async (request, portalId, projectId, timeLog) => {
        const response = await httpService.post(
            `${ZOHO_API_URL}/portal/${portalId}/projects/${projectId}/logs/?date=${timeLog.date}&name=${timeLog.taskName}&bill_status=${timeLog.billStatus}&hours=${timeLog.hours}&notes=${timeLog.note}`,
            {},
            request
        )
        return response.tasks ?? []
    }
}