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
    fetchMyTasks: async (portalId, projectId) => {
        const response = await httpService.get(`/api/portals/${portalId}/projects/${projectId}/mytasks`)
        return response.data ?? []
    }
}

export const Bug = {
    fetchMyBugsForProject: async (portalId, projectId) => {
        const response = await httpService.get(`/api/portals/${portalId}/mybugs`)
        const myBugs = response.data ?? []
        return myBugs.filter(bug => {
            return bug.project_id_string === `${projectId}`
        })
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
    fetchTimeLogById: async (portalId, date) => {
        const response = await httpService.post(`/api/portals/${portalId}/logs`, {
            userId: StorageService.common.getZohoUserId(),
            date: date
        })
        return response.data ?? []
    },
}
