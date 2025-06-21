import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Example: get roles from a user session, JWT, or other auth mechanism
  // For demo, we'll just return a static array
  // In a real app, extract roles from the user's auth token or session

  // Example: roles from a decoded JWT or session
  // const roles = req.session?.user?.roles || [];

  // For now, return a static array
  const roles = ["user", "admin"];
  res.status(200).json(roles);
}
