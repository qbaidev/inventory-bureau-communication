import { Injectable } from "@nestjs/common"

@Injectable()
export class TicketsService {
  findAll() { return [] }
  findOne(id: string) { return null }
  submit(data: any) { return data }
}
