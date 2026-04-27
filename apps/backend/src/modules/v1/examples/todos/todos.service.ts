import { Injectable } from "@nestjs/common"

@Injectable()
export class TodosService {
  findAll() { return [] }
  findOne(id: number) { return null }
  create(data: any) { return data }
  update(id: number, data: any) { return data }
  remove(id: number) { return { id } }
}
