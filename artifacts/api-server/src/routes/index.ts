import { Router, type IRouter } from "express";
import healthRouter from "./health";
import programmeDemoRouter from "./programme-demo";

const router: IRouter = Router();

router.use(healthRouter);
router.use(programmeDemoRouter);

export default router;
