import express, {Request, Response} from 'express'
const router = express.Router()

import axios from 'axios'

router.get('/github/callback', async (req: Request, res: Response) => {
  console.log('code: ', req.query.code)
  // The req.query object has the query params that were sent to this route.
  const requestToken = req.query.code

  const response: any = await axios({
    method: 'post',
    url: `https://github.com/login/oauth/access_token?client_id=${process.env.GH_CLIENT_ID}&client_secret=${process.env.GH_CLIENT_SECRET}&code=${requestToken}`,
    headers: {
      accept: 'application/json'
    }
  })

  console.log('token: ', response.data.access_token)

  const user= await axios( {
    method: 'get',
    url: 'https://api.github.com/user',
    headers: {
      Authorization: 'token ' + response.data.access_token
    }
  })

  res.status(200).json({
    status: 200,
    user: user.data
  })

})

router.all('*', (req: Request, res: Response) => {

  res.status(404).json({
    status: 404,
    message: 'page doesn\'t exist',
  })
})

module.exports = router