export const httpService = {
    get: async (url) => {
        const response = await fetch(url, {
            method: 'GET'
        })
        return await response.json()
    },
    post: async (url, postData) => {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(postData),
        })
        return await response.json()
    }
}

export const Portal = {
    fetchAll: async () => {
        const response = await httpService.get(`/api/portals/`)
        return response.data ?? []
    }
}

export const Project = {
    fetchAll: async (portalId) => {
        const response = await httpService.get(`/api/portals/${portalId}/projects`)
        return response.data ?? []
    }
}

export const Task = {
    fetchAllForProject: async (portalId, projectId) => {
        const response = await httpService.get(`/api/portals/${portalId}/projects/${projectId}/tasks`)
        return response.data ?? []
    },
    fetchMyTasks: async (portalId, projectId) => {
        const response = await httpService.get(`/api/portals/${portalId}/projects/${projectId}/mytasks`)
        return response.data ?? []
    }
}

export const Timesheet = {
    addLog: async (portalId, projectId, taskId, taskName, date, hours, note, billStatus) => {
        let response;
        if (taskId) {
            response = await httpService.post(
                `/api/portals/${portalId}/projects/${projectId}/tasks/${taskId}/logs`,
                {date, billStatus, hours, note}
            )
        } else if (taskName) {
            response = await httpService.post(
                `/api/portals/${portalId}/projects/${projectId}/logs`,
                {date, billStatus, hours, taskName, note}
            )
        } else {
            throw new Error('Please pick a Task from the Project or provide a Task Name')
        }
        return response.data ?? []
    }
}
