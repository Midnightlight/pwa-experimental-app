import { Request, Response } from "express";

export const route =
  (cb: (req: Request, res: Response) => void | Promise<void>) =>
  async (req: Request, res: Response) => {
    try {
      return await cb(req, res);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
