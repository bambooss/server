const model_user = require('../src/api/models/model-user')

let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../src/server.ts')

chai.use(chaiHttp)
chai.config.includeStack = false
let expect = chai.expect

//Our parent block
describe('Middlewares', () => {

  // Test create user route
  describe('AUTH middleware', () => {

    it('it should respond with "Authentication error" when no token present', (done) => {
      chai.request(server)
        .get('/user')
        .end((err, res) => {
          expect(res, 'res.status should be 401').to.have.status(401)
          expect(res.body.message).to.be.equal('Authentication error')
          done()
        })
    })

    it('it should respond with "Authentication error" when invalid token is present', done => {
      const invalidToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2MTQ2NTQwMDgsImV4cCI6MTY0NjE5MDAxNCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIl9pZCI6IjYwM2MzMzNjZmFjNDRiMzI3ZGE4MmE0OCIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.kfMIc-t4zmdXmJe6W_KMwmuZbBpOq63emqARvhArj7E'
      chai.request(server)
        .get('/user')
        .set('Authorization', `Bearer ${invalidToken}`)
        .end((err, res) => {
          expect(res, 'res.status should be 401').to.have.status(401)
          expect(res.body.message).to.be.equal('Authentication error')
          done()
        })
    })
  })

})