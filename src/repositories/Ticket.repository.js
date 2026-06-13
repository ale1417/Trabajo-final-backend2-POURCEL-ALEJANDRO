import TicketDAO from "../dao/Ticket.dao.js";

export default class TicketRepository {
  constructor() {
    this.dao = new TicketDAO();
  }

  async createTicket(ticketData) {
    return await this.dao.create(ticketData);
  }
}
