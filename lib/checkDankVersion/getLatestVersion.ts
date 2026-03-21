import { Socket } from 'node:net'

export async function getLatestVersion(): Promise<string | null> {
    if (await checkNetwork()) {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 2000)
        try {
            const response = await fetch(
                `https://registry.npmjs.org/@eighty4/dank/latest`,
                { signal: controller.signal },
            )
            clearTimeout(timeout)
            if (response.ok) {
                const json: { version: string } = (await response.json()) as {
                    version: string
                }
                return json.version
            }
        } catch (e: any) {
            clearTimeout(timeout)
            return null
        }
    }
    return null
}

async function checkNetwork(): Promise<boolean> {
    return new Promise(res => {
        const s = new Socket()
        s.once('connect', () => {
            s.end()
            s.unref()
            res(true)
        })
        s.once('error', () => {
            s.end()
            s.unref()
            res(false)
        })
        s.connect(443, '8.8.8.8')
    })
}
