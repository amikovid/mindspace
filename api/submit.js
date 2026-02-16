// Vercel serverless function to handle wisdom submissions
import { Client } from '@notionhq/client'

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { age, gender, occupation, wisdom } = req.body

    // Validate input
    if (!age || !gender || !occupation || !wisdom) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    if (wisdom.length < 10 || wisdom.length > 200) {
      return res.status(400).json({ error: 'Wisdom must be between 10 and 200 characters' })
    }

    // Initialize Notion client
    const notion = new Client({ auth: process.env.NOTION_API_KEY })

    // Create page in Notion database
    const response = await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_DATABASE_ID
      },
      properties: {
        'Wisdom': {
          title: [
            {
              text: {
                content: wisdom
              }
            }
          ]
        },
        'Age': {
          number: parseInt(age)
        },
        'Gender': {
          select: {
            name: gender
          }
        },
        'Occupation': {
          rich_text: [
            {
              text: {
                content: occupation
              }
            }
          ]
        },
        'Status': {
          select: {
            name: 'Pending Review'
          }
        },
        'Submitted': {
          date: {
            start: new Date().toISOString()
          }
        }
      }
    })

    return res.status(200).json({
      success: true,
      message: 'Wisdom submitted successfully',
      id: response.id
    })

  } catch (error) {
    console.error('Error submitting to Notion:', error)
    return res.status(500).json({
      error: 'Failed to submit wisdom',
      details: error.message
    })
  }
}
