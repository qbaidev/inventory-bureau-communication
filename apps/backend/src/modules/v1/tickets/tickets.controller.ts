import { Controller } from "@nestjs/common"
import { Implement } from "@orpc/nest"
import { implement } from "@orpc/server"

import { v1 } from "@/config/api-versions.config"

import { TicketsService } from "./tickets.service"

@Controller()
export class TicketsController {
	constructor(private readonly ticketsService: TicketsService) {}

	@Implement(v1.ticket.list)
	async listTickets() {
		return implement(v1.ticket.list).handler(async () => {
			return this.ticketsService.findAll() as any
		})
	}

	@Implement(v1.ticket.get)
	async getTicket() {
		return implement(v1.ticket.get).handler(async ({ input }: any) => {
			return this.ticketsService.findOne(String(input.id)) as any
		})
	}

	@Implement(v1.ticket.submit)
	async submitTicket() {
		return implement(v1.ticket.submit).handler(async ({ input }: any) => {
			return this.ticketsService.submit({ payload: input }) as any
		})
	}
}
