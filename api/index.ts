import { bootstrap } from '../src/main';

export default async (req: any, res: any) => {
  const app = await bootstrap();
  app(req, res);
};