import defaultSettings from '@/settings'

const title = defaultSettings.title || 'X-微卡'

export default function getPageTitle(pageTitle) {
    if (pageTitle) {
        return `${pageTitle} - ${title}`
    }
    return `${title}`
}
