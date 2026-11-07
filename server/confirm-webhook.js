import { PayOS } from '@payos/node'
const url = process.argv[2]
if (!url?.startsWith('https://')) throw new Error('Cung cấp HTTPS webhook URL công khai.')
const payos = new PayOS({ clientId: process.env.PAYOS_CLIENT_ID, apiKey: process.env.PAYOS_API_KEY, checksumKey: process.env.PAYOS_CHECKSUM_KEY, logLevel: 'off' })
await payos.webhooks.confirm(url)
console.log('Webhook đã được xác nhận.')
