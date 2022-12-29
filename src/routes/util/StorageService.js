const StorageService = {

    common: {
        getZohoUserId: () => {
            if (typeof localStorage !== 'undefined') {
                return localStorage.getItem('zoho-user-id')
            }
            return false
        },
        setZohoUserId: (zohoUserId) => {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('zoho-user-id', zohoUserId)
            }
            return false
        },
        getZohoPortalUser: () => {
            if (typeof localStorage !== 'undefined') {
                return JSON.parse(localStorage.getItem('zoho-portal-user'))
            }
            return false
        },
        setZohoPortalUser: (zohoUser) => {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('zoho-portal-user', JSON.stringify(zohoUser))
            }
            return false
        }
    },

    timer: {
        getData: () => {
            if (typeof localStorage !== 'undefined') {
                return JSON.parse(localStorage.getItem('timer-data'))
            }
            return false
        },
        setData: (timerData) => {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('timer-data', JSON.stringify(timerData))
            }
        },
        clearData: () => {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('timer-data')
            }
        }
    },

}

export default StorageService
