import express, { Request, Response } from 'express'

exports.createUser = async (req: express.Request, res: express.Response) => {
  res.send('create user route')
}