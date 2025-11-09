import {get_admin_actions} from "../services/dashboard_service.js";

async function get_dashboard (req, res)	{
  const page = req.query.page || 1;
  const data = await get_admin_actions(page);
  res.status(200).json(data);
}

export default get_dashboard;
