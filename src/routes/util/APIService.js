import StorageService from "./StorageService.js";

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
    },
    delete: async (url) => {
        const response = await fetch(url, {
            method: 'DELETE'
        })
        return await response.json()
    },
}

export const Auth = {
    logout: async () => {
        const response = await httpService.get(`/api/auth/logout`)
        return response.data ?? {}
    }
}

export const Portal = {
    fetchAll: async () => {
        const response = await httpService.get(`/api/portals/`)
        return response.data ?? []
    },
    fetchDetails: async (portalId) => {
        const response = await httpService.get(`/api/portals/${portalId}`)
        return response.data ?? []
    }
}

export const Project = {
    fetchAll: async (portalId) => {
        const response = await httpService.get(`/api/portals/${portalId}/projects`)
        return response.data ?? []
    },
    fetchUsers: async (portalId, projectId) => {
        const response = await httpService.get(`/api/portals/${portalId}/projects/${projectId}/users`)
        return response.data ?? []
    }
}

export const Task = {
    fetchTasksToSubmitTime: async (portalId, projectId, selectedPortalUserId) => {
        const response = await httpService.get(`/api/portals/${portalId}/projects/${projectId}/mytasks?zpuid=${selectedPortalUserId}`)
        return response.data ?? []
    }
}

export const Bug = {
    fetchBugsToSubmitTime: async (portalId, projectId, selectedPortalUserId) => {
        const response = await httpService.get(`/api/portals/${portalId}/projects/${projectId}/mybugs?zpuid=${selectedPortalUserId}`)
        return response.data ?? []
    }
}

export const Timesheet = {
    saveLog: async (portalId, projectId, taskMode, taskId, bugId, taskName, date, hours, note, billStatus, logId = null) => {
        if (taskMode === 'task') {
            return await Timesheet.saveLogForTask(portalId, projectId, taskId, taskName, date, hours, note, billStatus, logId)
        } else if (taskMode === 'bug') {
            return await Timesheet.saveLogForBug(portalId, projectId, bugId, taskName, date, hours, note, billStatus, logId)
        } else if (taskMode === 'general') {
            return await Timesheet.saveLogForProject(portalId, projectId, taskName, date, hours, note, billStatus, logId)
        } else {
            throw new Error('Please pick a Task from the Project or provide a Task Name')
        }
    },
    saveLogForTask: async (portalId, projectId, taskId, taskName, date, hours, note, billStatus, logId = null) => {
        const response = await httpService.post(
            `/api/portals/${portalId}/projects/${projectId}/tasks/${taskId}/logs`,
            {date, billStatus, hours, note, logId}
        )
        return response.data ?? []
    },
    saveLogForBug: async (portalId, projectId, bugId, taskName, date, hours, note, billStatus, logId = null) => {
        const response = await httpService.post(
            `/api/portals/${portalId}/projects/${projectId}/bugs/${bugId}/logs`,
            {date, billStatus, hours, taskName, note, logId}
        )
        return response.data ?? []
    },
    saveLogForProject: async (portalId, projectId, taskName, date, hours, note, billStatus, logId = null) => {
        const response = await httpService.post(
            `/api/portals/${portalId}/projects/${projectId}/logs`,
            {date, billStatus, hours, taskName, note, logId}
        )
        return response.data ?? []
    },
    fetchWeeklyLogsForCurrentUser: async (portalId, date) => {
        const response = await httpService.post(`/api/portals/${portalId}/logs`, {
            userId: StorageService.common.getZohoUserId(),
            date: date
        })
        return response.data ?? []
    },
    deleteTimeLog: async (portalId, projectId, taskId, bugId, logId, taskMode) => {
        if (taskMode === 'task') {
            return await Timesheet.deleteTaskLog(portalId, projectId, taskId, logId)
        } else if (taskMode === 'bug') {
            return await Timesheet.deleteBugLog(portalId, projectId, bugId, logId)
        } else if (taskMode === 'general') {
            return await Timesheet.deleteGeneralLog(portalId, projectId, logId)
        } else {
            throw new Error('Invalid task type')
        }
    },
    deleteTaskLog: async (portalId, projectId, taskId, logId) => {
        return await httpService.delete(
            `/api/portals/${portalId}/projects/${projectId}/tasks/${taskId}/logs/${logId}`
        )
    },
    deleteBugLog: async (portalId, projectId, bugId, logId) => {
        return await httpService.delete(
            `/api/portals/${portalId}/projects/${projectId}/bugs/${bugId}/logs/${logId}`
        )
    },
    deleteGeneralLog: async (portalId, projectId, logId) => {
        return await httpService.delete(
            `/api/portals/${portalId}/projects/${projectId}/logs/${logId}`
        )
    },
}
