// Import modules
import express from 'express'
import { savefrom } from '@bochilteam/scraper-savefrom'

// App setup
const app = express()
const PORT = process.env.PORT || 3000

// API Route
app.get('/download', async (req, res) => {
    const url = req.query.url
    if (!url) {
        return res.status(400).json({ error: 'URL required' })
    }

    try {
        const data = await savefrom(url)
        res.json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to get download links' })
    }
})

// Start server
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`))
