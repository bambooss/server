const mongoose = require('mongoose')
const model_user = require('../src/api/models/model-user')

let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../src/server.ts')
let should = chai.should()

chai.use(chaiHttp)

//Our parent block
describe('Users', () => {
  before((done) => { //Before test we empty the database
    model_user.remove({}, (err) => {
      done()
    })
  })

  // Test create user route
  describe('/user/register POST', () => {
    it('it should create a new user', (done) => {
      const user = {
        user: {
          username: 'Csecsi',
          email: 'csecsi85@gmail.com',
          password: '12345678a',
          password2: '12345678a',
          githubURL: 'Csecsi85',
          gitlabURL: 'csecsi85',
          bitbucketURL: 'csecsi',
          linkedinURL: 'gabor-csecsetka-539765111',
          technologies: ['HTML', 'CSS', 'JS'],
          languages: ['Hungarian', 'English', 'Spanish'],
          bio: 'This is my test bio'
      }
      }

      chai.request(server)
        .post('/user/register')
        .send(user)
        .end((err, res) => {
          // console.log(res)
          res.should.have.status(201)
          done()
        })
    })
  })
})