const mongoose = require('mongoose')
const model_user = require('../src/api/models/model-user')

let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../src/server.ts')
chai.use(chaiHttp)
chai.config.includeStack = false
let expect = chai.expect



//Our parent block
describe('Users', () => {
  before((done) => { //Before test we empty the database
    model_user.remove({}, (err) => {
      done()
    })
  })

  // Test create user route
  describe('/user/register POST', () => {
    it('it should create a new user (All fields correct)', (done) => {
      const user = {
        user: {
          username: 'Csecsi',
          email: 'csecsi85@gmail.com',
          password: '12345678a',
          confirmPassword: '12345678a',
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
          expect(res, 'res.status should be 201').to.have.status(201)
          expect(res.body.user, 'req.body.user is missing keys').to.be.an('object').to.include.all.keys('_id', 'username', 'email', 'password', 'isDeleted', 'avatar', 'githubURL', 'gitlabURL', 'bitbucketURL', 'linkedinURL', 'technologies', 'languages', 'bio', 'tokens', 'createdAt', 'updatedAt', '__v', 'resetPasswordToken')
          expect(res.body.user.username, 'Usernames don\'t match').to.equal(user.user.username)
          expect(res.body.user.email, 'Emails don\'t match').to.equal(user.user.email)
          expect(res.body.user.password, 'Password should be hidden').to.equal('***********')
          expect(res.body.user.githubURL, 'GitHub URL is not correct').to.equal(`https://github.com/${user.user.githubURL}`)
          expect(res.body.user.gitlabURL, 'GitLab URL is not correct').to.equal(`https://gitlab.com/${user.user.gitlabURL}`)
          expect(res.body.user.bitbucketURL, 'BitBucket URL is not correct').to.equal(`https://bitbucket.org/${user.user.bitbucketURL}/`)
          expect(res.body.user.linkedinURL, 'LinkedIn URL is not correct').to.equal(`https://www.linkedin.com/in/${user.user.linkedinURL}/`)
          expect(res.body.user.technologies, 'Technologies don\'t match').to.be.deep.equal(user.user.technologies)
          expect(res.body.user.languages, 'Languages don\'t match').to.be.deep.equal(user.user.languages)
          expect(res.body.user.bio, 'Bios don\'t match').to.be.deep.equal(user.user.bio)
          expect(res.body.user.isDeleted, 'isDeleted should be false').to.be.false
          expect(res.body.user.tokens, 'Token is missing').to.have.length(1)
          done()
        })
    })

    it('it should respond with user already exists and 409 status', (done) => {
      const user = {
        user: {
          email: 'csecsi85@gmail.com',
          password: '12345678a',
          confirmPassword: '12345678a',
        }
      }

      chai.request(server)
        .post('/user/register')
        .send(user)
        .end((err, res) => {
          expect(res, 'res.status should be 409').to.have.status(409)
          expect(res.body.message).to.be.equal('User already exists')
          done()
        })
    })

    it('it should respond with passwords do not match 400 status', (done) => {
      const user = {
        user: {
          email: 'csecsi86@gmail.com',
          password: '12345678a',
          confirmPassword: '12345678b',
        }
      }

      chai.request(server)
        .post('/user/register')
        .send(user)
        .end((err, res) => {
          expect(res, 'res.status should be 400').to.have.status(400)
          expect(res.body.message).to.be.equal('Passwords do not match')
          done()
        })
    })

    it('it should be a hashed password', (done) => {
      const user = {
        user: {
          username: 'Csecsi',
          email: 'csecsi86@gmail.com',
          password: '12345678a',
          confirmPassword: '12345678a',
        }
      }

      chai.request(server)
        .post('/user/register')
        .send(user)
        .end((err, res) => {
          expect(res, 'res.status should be 201').to.have.status(201)
          expect(res.body.user.password).to.include('$2a$11$')
          done()
        })
    })

    it('it should trim and lowerCase the email', (done) => {
      const user = {
        user: {
          username: 'Csecsi',
          email: '  cSecsi87@gmail.Com  ',
          password: '12345678a',
          confirmPassword: '12345678a',
        }
      }

      chai.request(server)
        .post('/user/register')
        .send(user)
        .end((err, res) => {
          expect(res, 'res.status should be 201').to.have.status(201)
          expect(res.body.user.email).to.be.equal('csecsi87@gmail.com')
          done()
        })
    })

    it('it should trim and lowerCase the username', (done) => {
      const user = {
        user: {
          username: '  Csecsi  ',
          email: 'csecsi88@gmail.com',
          password: '12345678a',
          confirmPassword: '12345678a',
        }
      }

      chai.request(server)
        .post('/user/register')
        .send(user)
        .end((err, res) => {
          expect(res, 'res.status should be 201').to.have.status(201)
          expect(res.body.user.username).to.be.equal('Csecsi')
          done()
        })
    })

    it('it should check if the password is longer than 8 characters', (done) => {
      const user = {
        user: {
          username: 'Csecsi',
          email: 'csecsi89@gmail.com',
          password: '1234567',
          confirmPassword: '1234567',
        }
      }

      chai.request(server)
        .post('/user/register')
        .send(user)
        .end((err, res) => {
          expect(res, 'res.status should be 400').to.have.status(400)
          expect(res.body.message).to.be.equal('Password is too short')
          done()
        })
    })

    it('it should check if the password is shorter than 128 characters', (done) => {
      const user = {
        user: {
          username: 'Csecsi',
          email: 'csecsi89@gmail.com',
          password: '1234567aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          confirmPassword: '1234567aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        }
      }

      chai.request(server)
        .post('/user/register')
        .send(user)
        .end((err, res) => {
          expect(res, 'res.status should be 400').to.have.status(400)
          expect(user.user.password).to.have.lengthOf.above(128)
          expect(res.body.message).to.be.equal('Password is too long')
          done()
        })
    })
  })
})