import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Events, Interaction } from "discord.js";
import { NecordExecutionContext } from "necord";
import { Observable } from "rxjs";

export const Roles = (...roleIds: string[]) => RolesDecorator(roleIds);
const RolesDecorator = Reflector.createDecorator<string[]>();

@Injectable()
export class DiscordRoleValidateInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> | Promise<Observable<any>> {
    const necordContext = NecordExecutionContext.create(context);
    const roles = this.reflector.get(RolesDecorator, necordContext.getHandler());
    if (!roles?.length) return next.handle();
    const [interaction] = necordContext.getContext<Events.InteractionCreate>() as [Interaction<'cached'>];

    for (const role of roles) {
      if (interaction.member?.roles.cache.has(role)) {
        necordContext.getArgByIndex(0).push(true);
        return next.handle();
      }
    }
    return next.handle();
  }
}

