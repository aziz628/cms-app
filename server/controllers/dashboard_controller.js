import {get_actions_log} from "../services/log_service.js";

async function get_dashboard (req, res)	{
  const page = req.query.page || 1;
  const data = await get_actions_log(page);
  res.status(200).json(data)
}

export default get_dashboard;
