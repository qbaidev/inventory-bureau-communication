import { Controller, Get, Post, Put, Delete, Param, Body } from "@nestjs/common"
import { AllowAnonymous } from "@thallesp/nestjs-better-auth"
import { TodosService } from "./todos.service"

@AllowAnonymous()
@Controller({ path: "todos", version: "1" })
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  findAll() { return this.todosService.findAll() }

  @Get(":id")
  findOne(@Param("id") id: string) { return this.todosService.findOne(parseInt(id)) }

  @Post()
  create(@Body() data: any) { return this.todosService.create(data) }

  @Put(":id")
  update(@Param("id") id: string, @Body() data: any) { return this.todosService.update(parseInt(id), data) }

  @Delete(":id")
  remove(@Param("id") id: string) { return this.todosService.remove(parseInt(id)) }
}
