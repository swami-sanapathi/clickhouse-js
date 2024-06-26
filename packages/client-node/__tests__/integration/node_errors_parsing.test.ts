import { createClient } from '../../src'

describe('[Node.js] errors parsing', () => {
  it('should return an error when URL is unreachable', async () => {
    const client = createClient({
      host: 'http://localhost:1111',
    })
    await expectAsync(
      client.query({
        query: 'SELECT * FROM system.numbers LIMIT 3',
      }),
    ).toBeRejectedWith(
      jasmine.objectContaining({
        code: 'ECONNREFUSED',
      }),
    )
  })
})
