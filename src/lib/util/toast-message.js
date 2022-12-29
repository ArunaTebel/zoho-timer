import {toast} from '@zerodevx/svelte-toast'

export const success = m => toast.push(m, {
    theme: {
        '--toastBackground': 'green',
        '--toastColor': 'white',
        '--toastBarBackground': 'olive',
        '--toastBarHeight': 0
    },
    duration: 20000
})

export const warning = m => toast.push(m, {
    theme: {
        '--toastBackground': 'orange',
        '--toastColor': 'white',
        '--toastBarBackground': 'olive',
        '--toastBarHeight': 0
    },
    duration: 20000
})

export const error = m => toast.push(m, {
    theme: {
        '--toastBackground': 'red',
        '--toastColor': 'white',
        '--toastBarBackground': 'olive',
        '--toastBarHeight': 0
    },
    duration: 20000
})