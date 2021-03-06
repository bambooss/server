const model_technology = require('../src/api/models/model-technology')
const model_user = require('../src/api/models/model-user')

let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../src/server.ts')

chai.use(chaiHttp)
chai.config.includeStack = false
let expect = chai.expect

let token
let token2

//Our parent block
describe('Technologies', () => {
  before((done) => {
    //Before test we empty the databases
    model_user.remove({}, function(err) {
      if (err) done(err)
    })
    model_technology.remove({}, function(err) {
      if (err) done(err)
    })
    done()
  })

  it('it should create an ADMIN user', (done) => {
    const body = {
      user: {
        username: 'Csecsi',
        email: 'csecsi85@gmail.com',
        password: '12345678a',
        confirmPassword: '12345678a',
        githubURL: 'Csecsi85',
        gitlabURL: 'csecsi85',
        bitbucketURL: 'csecsi',
        linkedinURL: 'gabor-csecsetka-539765111',
        technologies: ['JavaScript', 'React', 'Angular'],
        languages: ['Hungarian', 'English', 'Spanish'],
        bio: 'This is my test bio'
      }
    }

    chai
      .request(server)
      .post('/user/register')
      .send(body)
      .end((err, res) => {
        expect(res, 'res.status should be 201').to.have.status(201)
        expect(res.body.user, 'res.body.user is missing keys')
          .to.be.an('object')
          .to.include.all.keys(
          '_id',
          'username',
          'email',
          'avatar',
          'githubURL',
          'gitlabURL',
          'bitbucketURL',
          'linkedinURL',
          'technologies',
          'languages',
          'bio',
          'tokens',
          'createdAt',
          'updatedAt',
          '__v',
          'resetPasswordToken'
        )
        expect(res.body.user.username, 'Usernames don\'t match').to.equal(
          body.user.username
        )
        expect(res.body.user.email, 'Emails don\'t match').to.equal(
          body.user.email
        )
        expect(res.body.user.githubURL, 'GitHub URL is not correct').to.equal(
          `https://github.com/${body.user.githubURL}`
        )
        expect(res.body.user.gitlabURL, 'GitLab URL is not correct').to.equal(
          `https://gitlab.com/${body.user.gitlabURL}`
        )
        expect(
          res.body.user.bitbucketURL,
          'BitBucket URL is not correct'
        ).to.equal(`https://bitbucket.org/${body.user.bitbucketURL}/`)
        expect(
          res.body.user.linkedinURL,
          'LinkedIn URL is not correct'
        ).to.equal(`https://www.linkedin.com/in/${body.user.linkedinURL}/`)
        expect(
          res.body.user.technologies,
          'Technologies don\'t match'
        ).to.be.deep.equal(body.user.technologies)
        expect(
          res.body.user.languages,
          'Languages don\'t match'
        ).to.be.deep.equal(body.user.languages)
        expect(res.body.user.bio, 'Bios don\'t match').to.be.deep.equal(
          body.user.bio
        )
        expect(res.body.user.tokens, 'Token is missing').to.have.length(1)

        token = res.body.user.tokens[0].token
        done()
      })
  })

  it('it should create a NORMAL user', (done) => {
    const body = {
      user: {
        username: 'Csecsi',
        email: 'csecsi100@gmail.com',
        password: '12345678a',
        confirmPassword: '12345678a',
        githubURL: 'Csecsi85',
        gitlabURL: 'csecsi85',
        bitbucketURL: 'csecsi',
        linkedinURL: 'gabor-csecsetka-539765111',
        technologies: ['JavaScript', 'React', 'Angular'],
        languages: ['Hungarian', 'English', 'Spanish'],
        bio: 'This is my test bio'
      }
    }

    chai
      .request(server)
      .post('/user/register')
      .send(body)
      .end((err, res) => {
        expect(res, 'res.status should be 201').to.have.status(201)
        expect(res.body.user, 'res.body.user is missing keys')
          .to.be.an('object')
          .to.include.all.keys(
          '_id',
          'username',
          'email',
          'avatar',
          'githubURL',
          'gitlabURL',
          'bitbucketURL',
          'linkedinURL',
          'technologies',
          'languages',
          'bio',
          'tokens',
          'createdAt',
          'updatedAt',
          '__v',
          'resetPasswordToken'
        )
        expect(res.body.user.username, 'Usernames don\'t match').to.equal(
          body.user.username
        )
        expect(res.body.user.email, 'Emails don\'t match').to.equal(
          body.user.email
        )
        expect(res.body.user.githubURL, 'GitHub URL is not correct').to.equal(
          `https://github.com/${body.user.githubURL}`
        )
        expect(res.body.user.gitlabURL, 'GitLab URL is not correct').to.equal(
          `https://gitlab.com/${body.user.gitlabURL}`
        )
        expect(
          res.body.user.bitbucketURL,
          'BitBucket URL is not correct'
        ).to.equal(`https://bitbucket.org/${body.user.bitbucketURL}/`)
        expect(
          res.body.user.linkedinURL,
          'LinkedIn URL is not correct'
        ).to.equal(`https://www.linkedin.com/in/${body.user.linkedinURL}/`)
        expect(
          res.body.user.technologies,
          'Technologies don\'t match'
        ).to.be.deep.equal(body.user.technologies)
        expect(
          res.body.user.languages,
          'Languages don\'t match'
        ).to.be.deep.equal(body.user.languages)
        expect(res.body.user.bio, 'Bios don\'t match').to.be.deep.equal(
          body.user.bio
        )
        expect(res.body.user.tokens, 'Token is missing').to.have.length(1)

        token2 = res.body.user.tokens[0].token
        done()
      })
  })

  describe('POST /technology/generate', () => {
    it('it should create all new technologies', (done) => {
      chai
        .request(server)
        .post('/technology/generate')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res, 'status should be 201').to.have.status(201)
          setTimeout(function() {
            done()
          }, 3000)
        })
    })

    it('it should throw a 404 page not found error for normal user', (done) => {
      chai
        .request(server)
        .post('/technology/generate')
        .set('Authorization', `Bearer ${token2}`)
        .end((err, res) => {
          expect(res, 'status should be 404').to.have.status(404)
          done()
        })
    })
  })

  describe('GET /technology', () => {
    it('it should list all technologies in the DB', (done) => {
      chai.request(server)
        .get('/technology')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res, 'status should be 200').to.have.status(200)
          expect(res.body.technologies).to.be.an('array').and.to.have.length(90)
          expect(
            res.body.technologies[0],
            'req.body.technologies[0] is missing keys'
          )
            .to.be.an('object')
            .to.include.all.keys('_id', 'name')
          done()
        })
    })
  })

  describe('PATCH /technology/name', () => {
    it('it should change the name of the technology', (done) => {
      const body = {
        name: 'Angular',
        newName: 'Angular2'
      }
      chai.request(server)
        .patch('/technology/name')
        .set('Authorization', `Bearer ${token}`)
        .send(body)
        .end((err, res) => {
          expect(res, 'status should be 200').to.have.status(200)

            model_technology.findOne({ name: body.newName }).then(res => {
              expect(res.name, 'Something wrong with newName').to.equal(body.newName)
              done()
            })
              .catch(err1 => {
                done(err1)
              })
        })
    })

    it('it should throw a 400 error, no technology found', (done) => {
      const body = {
        name: 'Angular33',
        newName: 'Angular2'
      }
      chai.request(server)
        .patch('/technology/name')
        .set('Authorization', `Bearer ${token}`)
        .send(body)
        .end((err, res) => {
          expect(res, 'status should be 400').to.have.status(400)
          done()
        })
    })

    it('it should throw a 400, page not found error for normal user', (done) => {
      const body = {
        name: 'Angular',
        newName: 'Angular2'
      }
      chai.request(server)
        .patch('/technology/name')
        .set('Authorization', `Bearer ${token2}`)
        .send(body)
        .end((err, res) => {
          expect(res, 'status should be 404').to.have.status(404)
          done()
        })
    })
  })

  describe('DELETE /technology', () => {
    it('it should delete a single technology by name', (done) => {
      const body = {
        name: 'Angular2',
      }

      chai.request(server)
        .delete('/technology')
        .set('Authorization', `Bearer ${token}`)
        .send(body)
        .end((err, res) => {
          expect(res, 'status should be 200').to.have.status(200)

          model_technology.findOne({ name: body.newName }).then(res => {
            expect(res, 'Technology hasn\'t been deleted').to.be.null
            done()
          })
            .catch((err) => {
              done(err)
            })
        })
    })

    it('it should throw a 400 error, no technology found', (done) => {
      const body = {
        name: 'Angular24444',
      }

      chai.request(server)
        .delete('/technology')
        .set('Authorization', `Bearer ${token}`)
        .send(body)
        .end((err, res) => {
          expect(res, 'status should be 400').to.have.status(400)
          done()
        })
    })

    it('it should throw a 404, page not found error for normal user', (done) => {
      const body = {
        name: 'Angular',
      }
      chai.request(server)
        .delete('/technology')
        .set('Authorization', `Bearer ${token2}`)
        .send(body)
        .end((err, res) => {
          expect(res, 'status should be 404').to.have.status(404)
          done()
        })
    })
  })

  describe('DELETE /technology/all', () => {
    it('it should delete a single technology by name', (done) => {

      chai.request(server)
        .delete('/technology/all')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res, 'status should be 200').to.have.status(200)

          model_technology.find({}).then(res => {
            expect(res, 'There are technologies left in the DB!!!').to.be.an('array').with.length(0)
            done()
          })
            .catch((err) => {
              done(err)
            })
        })
    })

    it('it should throw a 404, page not found error for normal user', (done) => {

      chai.request(server)
        .delete('/technology/all')
        .set('Authorization', `Bearer ${token2}`)
        .end((err, res) => {
          expect(res, 'status should be 404').to.have.status(404)
          done()
        })
    })
  })
})
