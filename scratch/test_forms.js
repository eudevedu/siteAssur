import { formsApi } from '../lib/api/forms'

async function test() {
  try {
    const data = await formsApi.getAll()
    console.log('Forms:', data)
  } catch (error) {
    console.error('Error fetching forms:', error)
  }
}

test()
