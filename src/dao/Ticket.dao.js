import TicketModel from "../models/Ticket.model.js";

export default class TicketDAO {
  async create(ticketData) {
    return await TicketModel.create(ticketData);
  }
}
