const StorageService = {

    common: {
        getZohoUserId: () => {
            if (typeof localStorage !== 'undefined') {
                return JSON.parse(localStorage.getItem('zoho-user-id'))
            }
            return false
        },
        setZohoUserId: (zohoUserId) => {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('zoho-user-id', JSON.stringify(zohoUserId))
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
